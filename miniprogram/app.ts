App({
  globalData: {
    apiBase: 'https://api.hclims.example.com/api/v1',
    token: '',
  },
  onLaunch() {
    console.log('HC-LIMS Mini Program launched');
    // Check login status
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },
});
