import log from '../../instances/log/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  timeUpdate(e) {
    console.log(e)
  },
  timeUpdate(e) {
    console.log(e)
    log.info(e.detail)
  },
  errorHandle(e) {
    console.log(e)
    log.info(e)
  }
})