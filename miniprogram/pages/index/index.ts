Page({
  data: {
    stats: { todaySamples: 0, inProgress: 0, todayCompleted: 0, pendingSync: 0 },
    tasks: [],
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    const app = getApp();
    try {
      const [statsRes, tasksRes] = await Promise.all([
        wx.request({ url: `${app.globalData.apiBase}/dashboard/stats`, header: { Authorization: app.globalData.token } }),
        wx.request({ url: `${app.globalData.apiBase}/mobile/tasks?status=pending`, header: { Authorization: app.globalData.token } }),
      ]);
      if (statsRes.data?.code === 200) {
        this.setData({ stats: statsRes.data.data });
      }
      if (tasksRes.data?.code === 200) {
        this.setData({ tasks: tasksRes.data.data?.list?.slice(0, 5) || [] });
      }
    } catch (e) {
      console.error('loadData failed', e);
    }
  },

  goToSampling() {
    wx.navigateTo({ url: '/pages/sampling/index' });
  },
  goToScan() {
    wx.scanCode({
      success: (res) => {
        wx.navigateTo({ url: `/pages/scan-receipt/index?barcode=${res.result}` });
      },
    });
  },
  goToResultEntry() {
    wx.navigateTo({ url: '/pages/result-entry/index' });
  },
  goToReports() {
    wx.navigateTo({ url: '/pages/report-view/index' });
  },
});
