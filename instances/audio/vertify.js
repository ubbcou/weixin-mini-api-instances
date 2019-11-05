// 获取类型
// type list: 'Number', 'String', 'Boolean', 'Null', 'Undefined', 'Symbol', 'Array', 'Object'
function getType(obj) {
  return Object.prototype.toString.call(obj).match(/\[object ([a-zA-Z]*)\]/)[1];
}

// 校验类型
function vertify(key, value, type, isRequire = false) {
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
export function vertifyAudioConfig(config) {
  vertify('config', config, 'Object', true)
  vertify('src', config.src, 'String', true)
  vertify('startTime', config.startTime, 'String', false)
  vertify('onCanplay', config.onCanplay, 'Function', false)
  vertify('onPlay', config.onPlay, 'Function', false)
  vertify('onPause', config.onPause, 'Function', false)
  vertify('onStop', config.onStop, 'Function', false)
  vertify('onEnded', config.onEnded, 'Function', false)
  vertify('onTimeUpdate', config.onTimeUpdate, 'Function', false)
  vertify('onError', config.onError, 'Function', false)
  vertify('onWaiting', config.onWaiting, 'Function', false)
  vertify('onSeeking', config.onSeeking, 'Function', false)
  vertify('onSeeked', config.onSeeked, 'Function', false)
}