#!/bin/bash
# HC-LIMS Quality Gate
set -e
echo "🔍 HC-LIMS Quality Gate"
echo "========================"
echo ""

echo "📝 TypeScript type check..."
npx tsc --noEmit && echo "  ✅ Passed" || { echo "  ❌ Failed"; exit 1; }

echo ""
echo "🧪 Unit tests..."
npx vitest run && echo "  ✅ Passed" || { echo "  ❌ Failed"; exit 1; }

echo ""
echo "🏗️  Build..."
npx vite build && echo "  ✅ Passed" || { echo "  ❌ Failed"; exit 1; }

echo ""
echo "========================"
echo "✅ All quality gates passed!"
