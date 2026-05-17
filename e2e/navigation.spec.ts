import { test, expect, Page } from '@playwright/test';

// ====================================
// 导航冒烟测试 — 所有页面打开/刷新/前进/后退
// ====================================

// 一级页面（侧边栏直连）
const LEVEL1_PAGES = [
  { path: '/dashboard', name: '首页驾驶舱' },
  { path: '/samples', name: '样品管理' },
  { path: '/tasks', name: '检测管理' },
  { path: '/reports', name: '报告管理' },
  { path: '/quality', name: '质量控制' },
  { path: '/instruments', name: '仪器管理' },
  { path: '/inventory', name: '库存管理' },
  { path: '/methods', name: '方法管理' },
  { path: '/personnel', name: '人员管理' },
  { path: '/clients', name: '客户管理' },
  { path: '/contracts', name: '合同管理' },
  { path: '/settings', name: '系统设置' },
  { path: '/schedules', name: '排期视图' },
  { path: '/statistics', name: '统计分析' },
  { path: '/query', name: '综合查询' },
  { path: '/coc', name: 'COC监管链' },
  { path: '/backup', name: '数据备份' },
  { path: '/compliance', name: '合规管理' },
  { path: '/monitor', name: '系统监控' },
  { path: '/scheduler', name: '批处理调度' },
];

// 二级页面（子路由）
const LEVEL2_PAGES = [
  { path: '/research/groups', name: '课题组管理' },
  { path: '/research/projects', name: '研究项目' },
  { path: '/research/eln', name: '电子实验记录' },
  { path: '/research/reservations', name: '仪器预约' },
  { path: '/teaching', name: '教学实验' },
  { path: '/safety', name: '安全管理' },
  { path: '/achievements', name: '成果管理' },
  { path: '/portal', name: '客户门户' },
  { path: '/audit-logs', name: '审计日志' },
  { path: '/notifications', name: '消息通知' },
  { path: '/help', name: '帮助' },
  { path: '/dict', name: '数据字典' },
  { path: '/profile', name: '个人中心' },
  { path: '/settings/field-configs', name: '自定义字段' },
  { path: '/ai/assistant', name: 'AI数据分析助手' },
  { path: '/ai/report', name: '智能报告生成器' },
  { path: '/ai/alerts', name: '异常预警看板' },
];

const ALL_PAGES = [...LEVEL1_PAGES, ...LEVEL2_PAGES];

/** 收集页面 JS 错误 */
async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('Download the React DevTools')) {
        errors.push(text.substring(0, 200));
      }
    }
  });
  return errors;
}

/** 登录 */
async function login(page: Page) {
  await page.goto('/login', { timeout: 15000 });
  await page.waitForSelector('#login_username', { timeout: 10000 });
  await page.fill('#login_username', 'admin');
  await page.fill('#login_password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
}

// 确保 playwright 超时更宽松
test.setTimeout(120000);

// ====================================
// TEST 1: 所有页面能正常打开（无 JS 错误）
// ====================================
test.describe('所有页面 — 打开测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const p of ALL_PAGES) {
    test(`${p.name} (${p.path}) — 打开无错误`, async ({ page }) => {
      const errors = await collectErrors(page);
      await page.goto(p.path, { timeout: 15000 });
      await page.waitForTimeout(3000);

      // 检查页面是否崩溃（React Error Boundary 会显示错误信息）
      const errorBoundary = await page.locator('text=Unexpected Application Error').count();
      expect(errorBoundary).toBe(0);

      // 检查是否真的渲染了内容
      const bodyText = await page.locator('#root').textContent();
      expect(bodyText).not.toBeNull();
      expect(bodyText!.length).toBeGreaterThan(0);

      // 检查 JS 错误
      const criticalErrors = errors.filter(
        (e) => !e.includes('favicon.ico') && !e.includes('third-party cookies')
      );
      expect(criticalErrors).toEqual([]);
    });
  }
});

// ====================================
// TEST 2: 页面刷新后正常
// ====================================
test.describe('页面刷新 — 刷新后无错误', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const p of ALL_PAGES.slice(0, 10)) {
    test(`${p.name} — 刷新后正常`, async ({ page }) => {
      const errors = await collectErrors(page);
      await page.goto(p.path, { timeout: 15000 });
      await page.waitForTimeout(2000);
      await page.reload({ timeout: 15000 });
      await page.waitForTimeout(3000);

      const errorCount = await page.locator('text=Unexpected Application Error').count();
      expect(errorCount).toBe(0);

      const bodyText = await page.locator('#root').textContent();
      expect(bodyText).not.toBeNull();
      expect(bodyText!.length).toBeGreaterThan(0);
    });
  }
});

// ====================================
// TEST 3: 前进/后退导航
// ====================================
test.describe('前进/后退 — 导航历史', () => {
  test('连续访问3个页面后 后退→前进 无错误', async ({ page }) => {
    const errors = await collectErrors(page);
    await login(page);

    // 依次访问 3 个页面
    const paths = ['/samples', '/tasks', '/reports'];
    for (const p of paths) {
      await page.goto(p, { timeout: 15000 });
      await page.waitForTimeout(1500);
    }

    // 后退 2 步: reports → tasks → samples
    await page.goBack({ timeout: 10000 });
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/tasks');

    await page.goBack({ timeout: 10000 });
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/samples');

    // 前进 1 步: samples → tasks
    await page.goForward({ timeout: 10000 });
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/tasks');

    // 检查无崩溃
    const crashed = await page.locator('text=Unexpected Application Error').count();
    expect(crashed).toBe(0);
  });
});

// ====================================
// TEST 4: 侧边栏导航菜单点击
// ====================================
test.describe('侧边栏菜单 — 点击导航', () => {
  test('点击侧边栏5个菜单项不崩溃', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    const menuItems = await page.locator('.ant-menu-item').all();
    expect(menuItems.length).toBeGreaterThan(5);

    // 点击前5个菜单项
    for (let i = 0; i < Math.min(5, menuItems.length); i++) {
      await menuItems[i].click();
      await page.waitForTimeout(1500);

      const errorCount = await page.locator('text=Unexpected Application Error').count();
      expect(errorCount).toBe(0);
    }
  });
});

// ====================================
// TEST 5: 登录页独立测试
// ====================================
test.describe('登录页 — 独立访问', () => {
  test('直接访问 /login 正常', async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto('/login', { timeout: 15000 });
    await page.waitForTimeout(3000);

    const errorCount = await page.locator('text=Unexpected Application Error').count();
    expect(errorCount).toBe(0);

    // 检查登录表单存在
    const usernameInput = await page.locator('#login_username').count();
    expect(usernameInput).toBe(1);
  });
});

// ====================================
// TEST 6: 直接 URL 访问（未登录跳转）
// ====================================
test.describe('未登录状态 — 页面跳转', () => {
  test('未登录访问 /dashboard → 跳转到 /login', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 15000 });
    await page.waitForTimeout(3000);
    // 应该被路由守卫重定向到 login
    expect(page.url()).toContain('/login');
  });
});
