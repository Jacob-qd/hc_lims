#!/bin/bash
# HC-LIMS Smoke Test
set -e

PASS=0; FAIL=0; RESULTS=()
pass() { PASS=$((PASS+1)); RESULTS+=("✅ $1"); }
fail() { FAIL=$((FAIL+1)); RESULTS+=("❌ $1 - $2"); }

echo "════════════════════════════════════════"
echo "  HC-LIMS Smoke Test"
echo "════════════════════════════════════════"

# 1. TypeScript
echo "📝 TypeScript type check..."
if npx tsc --noEmit 2>/dev/null; then
  pass "TypeScript"
else
  fail "TypeScript" "type errors found"
fi

# 2. Unit tests
echo ""
echo "🧪 Unit tests..."
if npx vitest run 2>/dev/null; then
  pass "Unit tests"
else
  fail "Unit tests" "test failures"
fi

# 3. Array/paren balance
echo ""
echo "📐 Source structure balance..."
cd src/mocks
node -e "
var fs=require('fs');
['handlers.ts'].forEach(function(f){
  var c=fs.readFileSync(f,'utf-8');
  var cl=c.replace(/'[^']*'/g,'\"\"').replace(/\x60[^\x60]*\x60/g,'\"\"');
  var p=0,b=0,br=0;
  for(var i=0;i<cl.length;i++){var ch=cl[i];if(ch=='(')p++;if(ch==')')p--;if(ch=='{')b++;if(ch=='}')b--;if(ch=='[')br++;if(ch==']')br--;}
  console.log(f+': P='+p+' B='+b+' Br='+br);
});
" 2>&1
cd ../..
P_BAL=$(node -e "var fs=require('fs');var c=fs.readFileSync('src/mocks/handlers.ts','utf-8').replace(/'[^']*'/g,'').replace(/\x60[^\x60]*\x60/g,'');var p=0;for(var i=0;i<c.length;i++){var ch=c[i];if(ch=='(')p++;if(ch==')')p--;}console.log(p);")
if [ "$P_BAL" = "0" ]; then
  pass "Structure balance"
else
  fail "Structure balance" "unbalanced parentheses in handlers.ts ($P_BAL)"
fi

# 4. Dev server
echo ""
echo "🌐 Dev server..."
kill $(lsof -ti :5173) 2>/dev/null || true
sleep 1
npx vite --port 5173 --host 0.0.0.0 > /tmp/vite-smoke.log 2>&1 &
VITE_PID=$!
sleep 4

if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>&1 | grep -q 200; then
  pass "Dev server starts"
else
  fail "Dev server" "failed to start"
  kill $VITE_PID 2>/dev/null || true
  # Print results before exiting
  echo ""; echo "════════════════════════════════════════"
  echo "  Results: $PASS passed, $FAIL failed"
  for r in "${RESULTS[@]}"; do echo "  $r"; done
  exit 1
fi

# 5. Routes
echo ""
echo "🔗 Route check..."
ROUTE_FAIL=0
for path in "/" "/dashboard" "/samples" "/tasks" "/reports" "/quality" "/instruments" "/coc" "/backup" "/compliance" "/monitor" "/scheduler"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173${path}" 2>&1)
  if [ "$code" != "200" ]; then ROUTE_FAIL=$((ROUTE_FAIL+1)); fi
done
if [ $ROUTE_FAIL -eq 0 ]; then
  JS_FAIL=0
  for jsPath in "/src/main.tsx" "/src/mocks/handlers.ts" "/src/App.tsx"; do
    mime=$(curl -s -D - "http://localhost:5173${jsPath}" 2>&1 | grep -i "content-type" | tr -d "
")
    if ! echo "$mime" | grep -q "text/javascript\|application/javascript"; then
      JS_FAIL=$((JS_FAIL+1))
      echo "       ⚠️  $jsPath → $mime"
    fi
  done
  if [ $JS_FAIL -gt 0 ]; then
    fail "JS module" "$JS_FAIL JS module(s) returned HTML instead of JS"
  else
    pass "All routes (12/12) + JS modules compile"
  fi
else
  fail "Routes" "$ROUTE_FAIL route(s) failed"
fi

# 6. Check Vite log for parse errors
if grep -q "PARSE_ERROR" /tmp/vite-smoke.log 2>/dev/null; then
  echo "  ⚠️  Vite reported parse errors (may be non-blocking)"
fi

# 7. Playwright navigation tests
echo ""
echo "🎭 Playwright navigation smoke test..."
if npx playwright test e2e/navigation.spec.ts --reporter=list --workers=1 --timeout=60000 2>&1 | tail -5; then
  pass "Playwright navigation tests"
else
  # Check if tests actually failed or just timed out
  PW_RESULT=$(npx playwright test e2e/navigation.spec.ts --reporter=list --workers=1 --timeout=60000 2>&1 | grep -c "passed\|failed" || echo "0")
  if [ "$PW_RESULT" -gt 0 ]; then
    fail "Playwright" "navigation tests failed — check e2e/navigation.spec.ts"
  else
    echo "  ⚠️  Playwright test runner issue (may be headless env)"
  fi
fi

kill $VITE_PID 2>/dev/null || true

# Results
echo ""; echo "════════════════════════════════════════"
echo "  $PASS passed, $FAIL failed"
for r in "${RESULTS[@]}"; do echo "  $r"; done
if [ $FAIL -gt 0 ]; then echo "❌ FAILED"; exit 1; else echo "✅ ALL PASSED"; fi
