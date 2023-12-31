import type { FormSubmit } from 'miniprogram/types/wechat'

interface FormData {
  timestamp: number
}

Page({
  data: {
    dialogs: [
      {
        id: 'timestampConvert',
        name: '时间戳转换'
      }
    ]
  },
  timestampConvertClose() {
    this.setData({
      timestampConvert: false
    })
  },
  timestampConvert() {
    this.setData({
      timestampConvert: true
    })
  },
  timestampConvertSubmit(e: FormSubmit<FormData>) {
    const { timestamp } = e.detail.value

    const date = (t: number) => {
      const now = new Date(t)
      const y = now.getFullYear()
      const m = now.getMonth() + 1
      const d = now.getDate()

      return (
        y +
        '-' +
        (m < 10 ? '0' + m : m) +
        '-' +
        (d < 10 ? '0' + d : d) +
        ' ' +
        now.toTimeString().substring(0, 8)
      )
    }

    this.setData({
      timestampConvertValue: date(timestamp * 1000)
    })
  }
})
