Page({
  data: {
    tasks: [],
    selectedTask: null as any,
    unitIndex: 0,
    units: ['mg/L', 'µg/L', 'pH', 'mg/kg', 'μg/m³', 'dB', 'CFU/mL', '个/L'],
    form: { resultValue: '', unit: '', detectionLimit: '', remark: '' },
    submitting: false,
  },

  onLoad() {
    this.loadTasks();
  },

  async loadTasks() {
    const app = getApp();
    try {
      const res = await wx.request({
        url: `${app.globalData.apiBase}/mobile/tasks?status=testing`,
        header: { Authorization: app.globalData.token },
      });
      if (res.data?.code === 200) {
        this.setData({ tasks: res.data.data?.list || [] });
      }
    } catch (e) {
      console.error('loadTasks failed', e);
    }
  },

  selectTask(e: any) {
    const task = this.data.tasks.find((t: any) => t.id === e.currentTarget.dataset.id);
    this.setData({ selectedTask: task });
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onUnitChange(e: any) {
    this.setData({ unitIndex: e.detail.value, 'form.unit': this.data.units[e.detail.value] });
  },

  async submit() {
    if (!this.data.form.resultValue) {
      wx.showToast({ title: '请输入结果', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    const app = getApp();
    try {
      const res = await wx.request({
        url: `${app.globalData.apiBase}/mobile/tests/${this.data.selectedTask.id}/result`,
        method: 'POST',
        header: { Authorization: app.globalData.token, 'Content-Type': 'application/json' },
        data: {
          ...this.data.form,
          recordedAt: new Date().toISOString(),
          recordedBy: '小程序用户',
        },
      });
      if (res.data?.code === 200) {
        wx.showToast({ title: '录入成功', icon: 'success' });
        this.setData({ selectedTask: null, form: { resultValue: '', unit: '', detectionLimit: '', remark: '' } });
        this.loadTasks();
      } else {
        wx.showToast({ title: res.data?.message || '录入失败', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '网络错误', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  cancel() {
    this.setData({ selectedTask: null, form: { resultValue: '', unit: '', detectionLimit: '', remark: '' } });
  },
});
