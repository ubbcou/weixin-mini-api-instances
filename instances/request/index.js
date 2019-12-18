import {
  getType,
  types
} from '../../utils/tool.js'

export const host = ''

class HttpV2 {
  constructor() {
    this.token = null    // 登录token
    this.gid = null      // 登录gid
    this.is_test = false // 登录是否是test
    this.isLogined = false  // 是否已经登录
    this.loginedInfo = null // 登录信息
    this.isLogining = false // 是否正在登录
  }
  setAuth({
    key,
    gid,
    is_test
  }) {
    this.loginedInfo = {
      key,
      gid,
      is_test: Boolean(is_test)
    }
    this.token = key
    this.gid = gid
    this.is_test = Boolean(is_test)
    wx.setStorageSync('3rd_session', key)
    wx.setStorageSync('gid', gid)
    // 测试key失效 
    // setTimeout(() => {
    //   wx.setStorageSync('3rd_session', 'xwqd')
    //   this.loginedInfo.key = 'xwqd'
    // }, 3000)
  }
  getAuth() {
    if (this.loginedInfo) {
      return this.loginedInfo
    } else {
      return {}
    }
  }
  config(config, method) {
    let result = {
      retryCount: 0, // 重新请求次数
      url: config.url,
      method,
      data: config.data,
      needAuth: true, // 需要登录
    }
    if (getType(config) !== types.Object) {
      return result
    } else {
      result = {
        ...result,
        ...config
      }
    }

    return result
  }
  // 获取wx code
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: ({
          code
        } = {}) => {
          if (code) {
            resolve(code)
          } else {
            reject(new Error('微信登录失败'))
          }
        },
        fail: () => {
          reject(new Error('微信登录网络异常'))
        },
      })
    })
  }
  // app login 实体
  appLogin(wxCode, runCount) {
    return new Promise(async (resolve, reject) => {
      try {
        // const loginInfo = await this.post({
        //   url: `${host}/api/login`,
        //   needAuth: false,
        //   data: {
        //     code: wxCode
        //   }
        // })
        // resolve(loginInfo)
        setTimeout(() => {
          resolve({ code: 20000, data: { key: 'xsx', gid: 1212 } })
        }, 3000)
      } catch (error) {
        reject(new Error(error.message))
      }
    })
  }
  // 获取app login信息(登录失败重试)
  async appLoginInfo() {
    let wxCode
    let loginInfo
    this.isLogining = true
    wx.showLoading({
      title: '登录中',
    })
    try {
      wxCode = await this.wxLogin()
      loginInfo = await this.appLogin(wxCode)
      wx.hideLoading()
      if (loginInfo && loginInfo.code === 20000) {
        return loginInfo
      } else {
        throw new Error(loginInfo.msg || '登录失败')
      }
    } catch (e) {
      wx.hideLoading()
      // 重试结束
      throw e
    }
  }
  waitLoginInfo() {
    let time = 0
    const duration = 50
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        time += duration
        if (timer >= 60000) { // 60s
          reject(new Error(`登录超时：${time}ms`))
        } else {
          if (this.isLogined) {
            clearInterval(timer)
            resolve()
          }
        }
      }, duration)
    })
  }
  request(config) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: config.url,
        method: config.method,
        data: config.data,
        header: {
          Front_End_Tag: 'httpv2',
          Authorization: this.getAuth().key
        },
        success: async (res) => {
          this.logs(config, res)
          if (res.data.code === 40003) { // 登录失效
            this.isLogined = false
            if (config.retryCount < 10) { // 登录失效，重新请求次数
              try {
                const response = await this.base({ ...config, retryCount: ++config.retryCount })
                resolve(response)
              } catch (e) {
                reject(new Error(e.message || '网络状态不佳，请切换网络再试试'))
              }
            } else {
              reject(new Error('无法登录，请重新进入'))
            }
          } else {
            // 40004 需要授权
            resolve(res.data || {})
          }
        },
        fail: err => {
          console.log(err)
          reject(new Error('网络状态不佳，请切换网络再试试'))
        }
      })
    })
  }
  base(config) {
    return new Promise(async (resolve, reject) => {
      if (!this.isLogined && config.needAuth) { // 需要登陆 并且还没登录
        try {
          if (this.isLogining) { // 登录中
            await this.waitLoginInfo()
          } else { // 登陆完成
            const loginInfo = await this.appLoginInfo()
            this.isLogined = true
            this.isLogining = false
            this.setAuth(loginInfo.data)
          }
          const response = await this.request(config)
          resolve(response)
        } catch (error) {
          this.isLogining = false
          reject(error)
        }
      } else {
        try {
          const response = await this.request(config)
          resolve(response)
        } catch (err) {
          reject(err)
        }
      }
    })
  }
  code4004(res) {
    if (res.code === 40004) {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage.route === 'pages/setting/setting') {
      } else {
        // wx.navigateTo({
        //   url: '/pages/setting/setting?path=/pages/index/index',
        // })
      }
      // 新增状态：忽略。（成功行为 错误行为 忽略行为）
      return { frontEndIgnore: true }
    } else {
      return res
    }
  }
  get(config) {
    const thisConfig = this.config(config, 'GET')
    return this.base(thisConfig)
      .then(res => {
        return this.code4004(res)
      })
  }
  post(config) {
    const thisConfig = this.config(config, 'POST')
    return this.base(thisConfig)
      .then(res => {
        return this.code4004(res)
      })
  }
}

export default new HttpV2()