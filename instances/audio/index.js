import { vertifyAudioConfig } from './vertify.js'

class Audio {
  constructor() {
    this.instances = [] // 所有实例（含无效和有效实例）
    this.instancesMaxLength = 4 // 有效实例长度
    this._nextId = 0
  }
  // 获取实例
  getInstance(config) {
    const ctx = wx.createInnerAudioContext()
    ctx.src = config.src
    config.onCanplay && ctx.onCanplay(config.onCanplay)
    config.onPlay && ctx.onPlay(config.onPlay)
    config.onPause && ctx.onPause(config.onPause)
    config.onStop && ctx.onStop(config.onStop)
    config.onEnded && ctx.onEnded(config.onEnded)
    config.onTimeUpdate && ctx.onTimeUpdate(config.onTimeUpdate)
    config.onError && ctx.onError(config.onError)
    config.onWaiting && ctx.onWaiting(config.onWaiting)
    config.onSeeking && ctx.onSeeking(config.onSeeking)
    config.onSeeked && ctx.onSeeked(config.onSeeked)
    return {
      _id: this._nextId++,
      ctx: ctx,
      ...config
    }
  }
  // 创建实例
  create(config) {
    vertifyAudioConfig(config)
    if (this.instances.length >= this.instancesMaxLength && (this.instances[this.instances.length - this.instancesMaxLength].ctx)) {
      this.destroy(this.instances[this.instances.length - this.instancesMaxLength])
    }
    const instance = this.getInstance(config)
    this.instances.push(instance)
    return instance
  }
  // 销毁实例
  destroy(instance) {
    const ctx = instance.ctx
    if (!ctx) {
      throw new Error('该实例已经销毁')
    }
    ctx.offCanplay()
    ctx.offPlay()
    ctx.offPause()
    ctx.offStop()
    ctx.offEnded()
    ctx.offTimeUpdate()
    ctx.offWaiting()
    ctx.offError()
    ctx.offSeeking()
    ctx.offSeeked()
    ctx.destroy()
    instance.ctx = null
  }
  // 播放实例
  play(instance) {
    const ctx = instance.ctx
    if (!ctx) {
      throw new Error('该实例已经销毁')
    }
    ctx.autoplay = true
    ctx.play()
  }
  // 销毁所有实例
  clear() {
    const instances = this.instances
    for (let i = 0; i < this.instances.length; i++) {
      const instance = instances[i]
      if (instance.ctx) {
        this.destroy(instance)
      }
    }
  }
}

export default new Audio