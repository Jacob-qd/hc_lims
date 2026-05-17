Page({
  data: {
    reports: [],
    keyword: '',
  },

  onLoad() {
    this.loadReports();
  },

  async loadReports() {
    const app = getApp();
    try {
      const res = await wx.request({
        url: `${app.globalData.apiBase}/reports`,
        header: { Authorization: app.globalData.token },
      });
      if (res.data?.code === 200) {
        const list = (res.data.data?.list || []).map((r: any) => ({
          id: r.id,
          reportNo: r.reportNo,
          title: r.title,
          customerName: r.customerName,
          status: r.status,
          statusLabel: r.statusLabel,
        }));
        this.setData({ reports: list });
      }
    } catch (e) {
      console.error('loadReports failed', e);
    }
  },

  onSearch(e: any) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    // In real app, debounce and call API; here we just filter client-side
    const all = this.data.reports;
    if (!keyword) {
      this.loadReports();
      return;
    }
    const filtered = all.filter((r: any) =>
      r.title.includes(keyword) || r.reportNo.includes(keyword) || r.customerName.includes(keyword)
    );
    this.setData({ reports: filtered });
  },

  viewDetail(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/report-detail/index?id=${id}` });
  },
});
