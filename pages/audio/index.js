const app = getApp()

Page({
  data: {
    audioIndexs: []
  },
  _var: {
    audios: [],
  },
  create() {
    const instance = app.$audio.create({
      src: 'https://xcx.alicdn2.hexiaoxiang.com/imgo/teacher/eval_audio/i/bfa41b95-87d5-4b95-a6b2-29d4cb7ec154.mp3',
      onPlay: function() {
        console.log('is play')
      }
    })
    this.setData({
      audioIndexs: [].concat(this.data.audioIndexs, this._var.audios.push(instance) - 1)
    })
  },
  playItem(e) {
    const { index } = e.currentTarget.dataset
    const itemInstance = this._var.audios[index]
    console.log(itemInstance)
    app.$audio.play(itemInstance)
  },
  clearAll() {
    app.$audio.clear()
  }
})
