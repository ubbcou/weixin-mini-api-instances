Page({
  data: {
    isRecordAuth: false,
    paper: '微风拂面，阳光正暖，而我还小，还有很多很多的时间去品尝生活的纯真与美好，这是一件多么幸福的事情啊!',
    recordOptions: {
      // duration: 10000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      // frameSize: 50
    }
  },

  _var: {
    manager: null
  },

  onShow() {
    console.log('x')
    this.checkRecordAuth()
  },

  checkRecordAuth() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              this.setData({
                isRecordAuth: true
              })
            }
          })
        } else {
          this.setData({
            isRecordAuth: true
          })
        }
      }
    })
  },

  postExam(paper, filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: '',
        filePath,
        name: 'Audio',
        formData: {
          Paper: paper,
          Project: 'test-record'
        },
        success: res => {
          resolve(res.data);
        },
        fail: err => {
          reject(new Error(err.errMsg));
        }
      });
    })
  },

  pushExam(tempFilePath) {
    const { paper } = this.data
    this.setData({
      isStart: false
    })
    wx.showLoading({
      title: '提交中',
    })
    this.postExam(paper, tempFilePath)
      .then(res => {
        wx.hideLoading()
        wx.showModal({
          title: '结果',
          content: res,
          showCancel: false
        })
      })
      .catch(err => {
        wx.hideLoading()
        wx.showModal({
          title: '结果',
          content: err.message,
          showCancel: false
        })
      })
  },

  start() {
    const { isRecordAuth, recordOptions } = this.data
    if (!isRecordAuth) {
      wx.showModal({
        title: '未授权',
        content: '点击去授权',
        success: ({confirm}) => {
          if (confirm) {
            wx.openSetting()
          }
        }
      })
    }
    this._var.manager = wx.getRecorderManager()
    if (this.isStart) {
      wx.showToast({
        title: '在录音，先停止提交',
        icon: 'none'
      })
    }
    this.setData({
      isStart: true
    })
    this._var.manager.onStart(() => {
      console.log('recorder start')
    })
    this._var.manager.onPause(() => {
      this._var.manager.stop()
    })
    this._var.manager.onError((e) => {
      wx.showModal({
        title: '有问题',
        content: e.errMsg,
        showCancel: false
      })
    })
    this._var.manager.onStop((res) => {
      const { tempFilePath } = res
      this.pushExam(tempFilePath)
    })
    this._var.manager.start(recordOptions)
  },

  stop() {
    if (this.data.isStart) {
      this._var.manager.stop()
    } else {
      wx.showToast({
        title: '没有在录音',
        icon: 'none'
      })
    }
  }
})