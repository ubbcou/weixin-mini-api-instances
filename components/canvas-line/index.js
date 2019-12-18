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
    canvasHeight: 0,
    _fillStyles: ['#eee', 'orange', 'green', 'red'], // 0 默认; 1选择；2正确；3错误
    _ctx: null,
    _drawInfo: {
      rects: [],
      lines: [], // 连接的rect index
    },
    _currentTargets: {
      a: -1,
      b: -1
    }
  },
  ready() {
    this.setCtx()
    this.validatorOptions()
    this.data._drawInfo.rects = this.getInitComputeRects()
    this.draw()
    this.getDeteail()
  },
  methods: {
    // 获取是否奇数，奇数右侧，偶数左侧矩形
    getIsOdd(value) {
      return value % 2 === 1
    },
    getMaxLen() {
      return Math.max(...this.data.payloadOptions.map(item => item.length))
    },
    getDeteail() {
      this.setData({
        canvasHeight: this.getCanvasHeight()
      })
    },
    setCtx() {
      this.data._ctx = wx.createCanvasContext('mainCanvas', this)
    },
    clickHandle(e) {
      const {
        x,
        y,
      } = e.detail
      const {
        offsetLeft
      } = e.target
      const {
        rect,
        index
      } = this.getValidatorPoint(x - offsetLeft, y)
      const maxLen = this.getMaxLen()
      // 点击区域存在矩形
      if (rect && this.validatorBinded(index) === -1) {
        const inLeft = index < maxLen
        this.data._drawInfo.rects[index].status = +!(this.data._drawInfo.rects[index].status)
        const lastIndex = this.getTargetLastIndex(index)
        if (lastIndex > -1) {
          this.data._drawInfo.rects[lastIndex].status = +!(this.data._drawInfo.rects[lastIndex].status)
        }
        if (inLeft) {
          this.data._currentTargets.a = index
        } else {
          this.data._currentTargets.b = index
        }
        // 可以链接两个矩形了
        if (this.validatorTarget(this.data._currentTargets.a) && this.validatorTarget(this.data._currentTargets.b)) {
          this.setCanvasLines(this.data._currentTargets.a, this.data._currentTargets.b)
          this.data._currentTargets.a = -1
          this.data._currentTargets.b = -1
          if (this.getMaxLen() === this.data._drawInfo.lines.length) {
            this.setDrawResult()
          }
        }
        this.draw()
      }
    },
    // 校验当前矩形是否与上一次矩形同侧
    // 返回上一个同侧的索引，否则返回-1
    getTargetLastIndex(currentIndex) {
      const maxLen = this.getMaxLen()
      const inLeft = currentIndex < maxLen
      const { a, b } = this.data._currentTargets
      if (!this.validatorTarget(a) && !this.validatorTarget(b)) {
        return -1
      } else {
        const lastIndex = this.data._drawInfo.rects[a > -1 ? a : b].index
        const lastInleft = lastIndex < maxLen
        if (inLeft === lastInleft) {
          return lastIndex
        } else {
          return -1
        }
      }
    },
    // 校验该矩形是否已经连接过
    // returns -1表示没有
    validatorBinded(rectIndex) {
      const {
        lines
      } = this.data._drawInfo
      const flatLines = lines.flat()
      return flatLines.findIndex(currentRectIndex => currentRectIndex === rectIndex)
    },
    // 校验存储的 rect index
    validatorTarget(pointIndex) {
      return pointIndex !== -1
    },
    // 校验2维数组是否长度一致
    validatorOptions() {
      const {
        payloadOptions
      } = this.data
      const maxLen = this.getMaxLen()
      return payloadOptions.every(currentValue => currentValue.length === maxLen)
    },
    draw() {
      const {
        rects,
        lines
      } = this.data._drawInfo
      this.data._ctx.clearRect(0, 0, 300, this.data.canvasHeight)

      for (let i = 0; i < rects.length; i++) {
        this.drawRectItem(rects[i])
      }

      for (let i = 0; i < lines.length; i++) {
        this.drawLineItem(lines[i])
      }
      this.data._ctx.draw()
    },
    drawRectItem(rect) {
      const ctx = this.data._ctx
      ctx.setFillStyle(this.data._fillStyles[rect.status])
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h) // x, y, w, h,
      ctx.setFillStyle('#fff')
      ctx.fillText(`ITEM: ${rect.item}  INDEX: ${rect.index}`, rect.x, rect.y + 20)
    },
    drawLineItem(line) {
      const {
        rects
      } = this.data._drawInfo
      const maxLen = this.getMaxLen()
      const pointRects = line.map(item => rects[item])
      const leftPoint = pointRects.find(item => item.index < maxLen)
      const rightPoint = pointRects.find(item => !(item.index < maxLen))
      const ax = leftPoint.x + rightPoint.w
      const ay = leftPoint.y + leftPoint.h / 2
      const bx = rightPoint.x
      const by = rightPoint.y + rightPoint.h / 2
      this.data._ctx.setStrokeStyle(this.data._fillStyles[leftPoint.status])
      this.data._ctx.beginPath()
      this.data._ctx.moveTo(ax, ay)
      this.data._ctx.lineTo(bx, by)
      this.data._ctx.setLineWidth(5)
      this.data._ctx.setLineCap('round')
      this.data._ctx.stroke()
    },
    // 获取初始化的矩形
    getInitComputeRects() {
      const {
        payloadOptions
      } = this.data

      const flatOptions = payloadOptions.flat()
      const canvasW = 300
      const elementMargin = 10
      const maxLen = this.getMaxLen()
      const rects = flatOptions.map((item, index) => {
        const inLeft = index < maxLen
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
          status: 0
        }
      })
      return rects
    },
    getCanvasHeight() {
      const maxLen = this.getMaxLen()
      const elementMargin = 10
      const elementH = 100

      return maxLen * (elementMargin + elementH)
    },
    // 校验点是否在某个矩形内
    getValidatorPoint(x, y) {
      const {
        rects
      } = this.data._drawInfo
      const validator = (rect, index) => {
        const x1 = rect.x
        const y1 = rect.y
        const x2 = rect.x + rect.w
        const y2 = rect.y + rect.h
        return x > x1 && y > y1 && x < x2 && y < y2
      }
      return {
        rect: rects.find(validator),
        index: rects.findIndex(validator),
      }
    },
    // 设置线段 并绘制
    setCanvasLines(a, b) {
      this.data._drawInfo.lines.push([a, b])
      this.draw()
    },
    // 设置绘制结果，显示出连线结果对错
    setDrawResult() {
      const {
        rightOptions
      } = this.data
      // rightOptions的值是索引+1
      const rightOptionsIndex = rightOptions.map(option => option.map(item => item - 1))
      const result = this.data._drawInfo.lines
        .filter(currentLine => {
          const rightIndex = rightOptionsIndex.findIndex(option => {
            return option.sort().toString() === currentLine.sort().toString()
          })
          return rightIndex > -1
        })
      const flatResult = result.flat()
      console.log('索引结果：', this.data._drawInfo.lines, ' 正确索引结果：', result)
      this.data._drawInfo.rects = this.data._drawInfo.rects.map(rect => {
        if (flatResult.findIndex(resultIndex => rect.index === resultIndex) > -1) {
          return { ...rect, status: 2 }
        } else {
          return { ...rect, status: 3 }
        }
      })
    }
  }
})