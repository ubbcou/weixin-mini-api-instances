# 集中管理 audio 实例

> wx.createInnerAudioContext()

## 应用场景
一个应用内需要大量使用音频播放，或许音频很短，一会就播放完了，一个不小心就会忘记清理实例（众所周知，微信小程序不清理实例可能会导致很多难以描述的bug）。  
于是产生这个集中管理 audio 的方案，它有这些特性：
- 最大有效实例长度
- 配置参数校验
- 可一次性清理所有实例

其它特性：
封装的方法总是容易让我们处理一些通用配置，例如交互埋点，丰富回调事件等

## 如何使用

```javascript
// app.js
import audio from './instances/audio/index.js'

App({
  $audio: audio
})
```

```javascript
// pages/audio/index
const app = getApp()

Page({
  audioInstance: null
  createInstance() {
    this.audioInstance = app.$audio.create({
      src: 'https://www...mp3',
      onPlay: function() {
        console.log('is play')
      }
    })
  },
  playItem() {
    app.$audio.play(this.audioInstance)
  },
  clearInstances() {
    app.$audio.clear()
  }
})

```


