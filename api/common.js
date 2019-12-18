import http, { host } from '../instances/request/index.js'

class CommonApi {
  /** api-获取message/teacher */
  getMessageTeacher(data) {
    return http.post({
      url: `${host}/api/message/teacher`,
      data,
    })
  }
}

export default new CommonApi()