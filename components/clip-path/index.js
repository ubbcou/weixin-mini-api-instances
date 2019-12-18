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
    lines: [
      'clip-path: polygon(0 0, 100px 0, 100px 2px, 0px 2px)',
      'clip-path: polygon(0 10px, 100px 10px, 100px 12px, 0px 12px)',
    ]
  },
  methods: {

  }
})
