// components/clip-path/index.js
Component({
  options: {
    pureDataPattern: /^_/
  },
  data: {
    payloadOptions: [
      [1, 2, 3],
      [4, 5, 6]
    ],
    rightOptions: [
      [1, 4],
      [2, 5],
      [3, 6]
    ],
    rects: [],
    height: 0,
    lines: [
      'clip-path: polygon(0 0, 100px 0, 100px 2px, 0px 2px)',
      'clip-path: polygon(0 10px, 100px 10px, 100px 12px, 0px 12px)',
    ],
    _targets: {a: -1, b: -1},
    systempInfo: {}
  },
  ready() {
    this.setData({
      rects: this.getInitComputeRects(),
      height: this.getHeight(),
      systempInfo: this.getSystemInfo()
    })
  },
  methods: {
    getInLeft(index) {
      return index < this.getMaxLen()
    },
    getMaxLen() {
      return Math.max(...this.data.payloadOptions.map(item => item.length))
    },
    getInitComputeRects() {
      const {
        payloadOptions
      } = this.data

      const flatOptions = payloadOptions.flat()
      const canvasW = 300
      const maxLen = this.getMaxLen()
      const elementMargin = 10
      const rects = flatOptions.map((item, index) => {
        const inLeft = this.getInLeft(index)
        const row = inLeft ? index : index - maxLen
        const w = 100
        const h = 100
        const centerLeft = (canvasW / 2 - w) / 2 // 居中的左边距
        const x = inLeft ? centerLeft : (centerLeft + canvasW / 2)
        const y = (h + elementMargin) * row
        return {
          x,
          y,
          w,
          h,
          index,
          item,
          status: 0,
          style: `
          position: absolute;
          width: ${w}px;
          height: ${h}px;
          left: ${x}px;
          top: ${y}px;
          background-color: red;
          `
        }
      })
      return rects
    },
    getHeight() {
      const maxLen = this.getMaxLen()
      const elementMargin = 10
      const elementH = 100

      return maxLen * (elementMargin + elementH)
    },
    touchStart(e) {
      const { rect, index } = this.getCurrentPosition(e)
      const inLeft = this.getInLeft(index)
      console.log(index)
      if (this.inLeft) {
        this.data._targets.a = index
      } else {
        this.data._targets.b = index
      }
    },
    touchEnd(e) {
      console.log(e)
      const { rect, index } = this.getCurrentPosition(e)
      const inLeft = this.getInLeft(index)
      const lasInSideIndex = this.getTargetLastIndex()
      if (lasInSideIndex > -1) {
        this.data._targets.a = -1
        this.data._targets.b = -1
        return
      }
      console.log(index)
      if (this.inLeft) {
        this.data._targets.a = index
      } else {
        this.data._targets.b = index
      }
    },
    // 校验存储的 rect index
    validatorTarget(pointIndex) {
      return pointIndex !== -1
    },
    // 校验当前矩形是否与上一次矩形同侧
    // 返回上一个同侧的索引，否则返回-1
    getTargetLastIndex(currentIndex) {
      const maxLen = this.getMaxLen()
      const inLeft = this.getInLeft(currentIndex)
      const { a, b } = this.data._targets
      if (!this.validatorTarget(a) && !this.validatorTarget(b)) {
        return -1
      } else {
        const lastIndex = this.data.rects[a > -1 ? a : b].index
        const lastInleft = lastIndex < maxLen
        if (inLeft === lastInleft) {
          return lastIndex
        } else {
          return -1
        }
      }
    },
    getValidatorPoint(x, y) {
      const {
        rects
      } = this.data
      const validator = (rect, index) => {
        const x1 = rect.x
        const y1 = rect.y
        const x2 = rect.x + rect.w
        const y2 = rect.y + rect.h
        return x >= x1 && y >= y1 && x < x2 && y < y2
      }
      return {
        rect: rects.find(validator),
        index: rects.findIndex(validator),
      }
    },
    getCurrentPosition(e) {
      const {
        clientX,
        clientY,
      } = e.changedTouches[0]
      const {
        offsetLeft,
        offsetTop
      } = e.target
      const { screenWidth } = this.data.systempInfo
      console.log(e)
      // const x = clientX - (screenWidth - 300) / 2
      return this.getValidatorPoint(offsetLeft, offsetTop)
    },
    getSystemInfo() {
      return wx.getSystemInfoSync()
    }
  },
})
