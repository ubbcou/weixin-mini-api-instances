import Taro from '@tarojs/taro'

export const host = 'http://127.0.0.1:5501'
interface Config {
  url: string
  data?: any
  headers?: any
}

interface BaseConfig {
  method: 'GET' | 'POST' | 'PUT' | "DELETE"
  url: string
  data?: any
  headers?: any
  noLogin?: boolean
}

interface BaseResolve {
  code: number
  msg: string
  data: any
}

interface Config {
  url: string
  data?: any
  headers?: any
  noLogin?: boolean
}


// usage:
// getUserInfo() {
//   return http.get({url: `${host}/list.json`, noLogin: false})
// }

class Http {
  constructor() {
  }
  _token = ''
  _loadToken = false // 是否在获取token中
  waitToken = new Promise((_, reject) => { reject() })
  get token() {
    return this._token
  }
  setToken(token: string) {
    this._token = token

  }
  // 登录
  login() {
    this._loadToken = true
    Taro.showLoading({ title: '登陆中' })
    let tempResolve: Function
    this.waitToken = new Promise((r1) => {
      tempResolve = r1
    })
    return this.systemLogin().then((code) => {
      // 登录参数
      const loginConfig = {
        url: `${host}/login.json`,
        noLogin: true,
        data: {
          code,
          version: undefined
        }
      }
      return this.get(loginConfig)
        .then(res => {
          this.setToken(res.data.key)
          tempResolve()
          this._loadToken = false
          Taro.hideLoading()
          return res
        })
    }).catch((err) => {
      Taro.hideLoading()
      return this.confirmRetryLogin(err)
    })
  }
  get(config: Config): Promise<BaseResolve> {
    const thisConfig = this.combineBaseConfig(config, 'GET')
    return this.request(thisConfig)
  }
  post(config: Config): Promise<BaseResolve> {
    const thisConfig = this.combineBaseConfig(config, 'POST')
    return this.request(thisConfig)
  }
  put(config: Config): Promise<BaseResolve> {
    const thisConfig = this.combineBaseConfig(config, 'PUT')
    return this.request(thisConfig)
  }
  delete(config: Config): Promise<BaseResolve> {
    const thisConfig = this.combineBaseConfig(config, 'DELETE')
    return this.request(thisConfig)
  }
  // 处理Method
  combineBaseConfig(config: Config, method: BaseConfig['method']): BaseConfig {
    const result = {
      ...config,
      method,
    }
    return result
  }
  // 重载super的request，处理登录情况
  async request(config: BaseConfig): Promise<BaseResolve> {
    // 不需要登录
    if (config.noLogin) {
      return this.dealResponse(config)
    } else {
      //需要登录
      //存在token
      if (this.token) {
        return this.dealResponse(this.insertAuthHeader(config))
      } else {
        // 不存在token
        if (this._loadToken) {
          // 正在获取token期间，用某种方式等待token获取完毕之后再正常执行请求
          return this.waitToken.then(() => {
            return this.dealResponse(this.insertAuthHeader(config))
          })

        } else {
          await this.login()
          return this.dealResponse(this.insertAuthHeader(config))
        }
      }
    }
  }
  // 处理状态码，返回相应数据
  dealResponse(config: BaseConfig) {
    console.log(config);

    return this.base(config)
      .then(res => {
        switch (res.code) {
          case 20000:
            return res
          case 40004: // 正在使用临时凭证，需要去授权
            throw new Error('需要授权')
          case 40002:
            throw new Error('需要重新登录')
          case 40023:
            throw new Error('信息获取意外')
          case 50000:
            throw new Error('服务端意外情况')
          default:
            throw new Error(`服务错误(${res.code})`)
        }
      })
  }
  insertAuthHeader(config: BaseConfig): BaseConfig {
    if (config.noLogin) {
      return config
    } else {
      return {
        ...config,
        headers: {
          Authorization: this.token
        }
      }
    }
  }
  // 重试登录
  confirmRetryLogin(reason): Promise<BaseResolve> {
    return new Promise((resolve, reject) => {
      Taro.showModal({
        content: '登录失败，是否重新登录',
        success: ({ confirm }) => {
          if (confirm) {
            resolve(this.login())
          } else {
            this._loadToken = false
            // 登录失败
            // throw new Error()
            // reject(reason)
            reject(reason)
          }
        }
      })
    })
  }
  systemLogin() {
    return new Promise((resolve, reject) => {
      Taro.login({
        success: ({ code }) => {
          if (code) {
            resolve(code)
          } else {
            reject(new Error('系统登录失败'))
          }
        },
        fail: () => {
          reject(new Error('网络错误，系统登录失败'))
        }
      })
    })
  }
  base(config: BaseConfig): Promise<BaseResolve> {
    return new Promise((resolve, reject) => {
      Taro.request({
        url: config.url,
        method: config.method,
        header: config.headers,
        data: config.data,
        success: (res) => {
          resolve(res.data)
        },
        fail: err => {
          reject(new Error(err.errMsg))
        }
      })
    })
  }
  goLogin(isAuth?: 1) {
    const currentPaages = Taro.getCurrentPages()
    const currentPage = currentPaages[currentPaages.length - 1]
    const currentRoute = `/${currentPage.route}`
    if (currentRoute !== '/pages/login/index') {
      if (isAuth) {
        Taro.reLaunch({ url: `/pages/login/index?isAuth=${isAuth || ''}` })
      } else {
        Taro.reLaunch({ url: '/pages/login/index' })
      }
    }
  }
}

export default new Http
