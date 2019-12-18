import { getType, types } from '../../utils/tool'

// 校验类型
function verify(key, value, type, isRequire = false) {
  if (isRequire) {
    if (getType(value) !== type) {
      throw new TypeError(`is require, 当前类型${getType(value)}, 期待类型${type}`)
    }
  } else {
    if (getType(value) !== 'Undefined' && getType(value) !== type) {
      throw new TypeError(`当前类型${getType(value)}, 期待类型${type}`)
    }
  }
}

// 校验音频配置类型
export function verifyAudioConfig(config) {
  verify('config', config, types.Object, true)
  verify('src', config.src, types.String, true)
  verify('startTime', config.startTime, types.String, false)
  verify('onCanplay', config.onCanplay, types.Function, false)
  verify('onPlay', config.onPlay, types.Function, false)
  verify('onPause', config.onPause, types.Function, false)
  verify('onStop', config.onStop, types.Function, false)
  verify('onEnded', config.onEnded, types.Function, false)
  verify('onTimeUpdate', config.onTimeUpdate, types.Function, false)
  verify('onError', config.onError, types.Function, false)
  verify('onWaiting', config.onWaiting, types.Function, false)
  verify('onSeeking', config.onSeeking, types.Function, false)
  verify('onSeeked', config.onSeeked, types.Function, false)
}