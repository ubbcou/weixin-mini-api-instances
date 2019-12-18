import audio from './instances/audio/index.js'
import CommonApi from './api/common.js'

App({
  $audio: audio,
  onLaunch() {
    // this.beginLogin()
  },
  async beginLogin() {
    const response = await this.checkIfLogined()
  },
  async checkIfLogined() {
    try {
      const response = await CommonApi.getMessageTeacher()
      return true
    } catch(err) {
      console.log(err)
      /**
       * 1. return false 将会在await正常返回
       * 2. throw err    将会本async内的catch接收
       */
      return false
    }
  }
})
