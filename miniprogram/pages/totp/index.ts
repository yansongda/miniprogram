import api from '@api/totp'
import { CODE } from '@constant/error'
import { WeixinError } from '@models/error'

Page({
  data: {
    toptipError: '',
    remainSeconds: 30,
    items: [] as ITotpItem[],
    intervalIdentity: 0,
    isScanQrCode: false,
    startX: 0,
    startY: 0
  },
  async onShow() {
    this.timing()

    if (this.data.isScanQrCode) {
      this.data.isScanQrCode = false

      return;
    }

    await this.all()
  },
  onHide() {
    this.clearInterval()
  },
  onUnload() {
    this.clearInterval()
  },
  timing() {
    let remainSeconds = 30 - (new Date()).getSeconds()
    if (remainSeconds < 0) {
      remainSeconds += 30
    }

    this.setData({remainSeconds})

    this.data.intervalIdentity = this.data.intervalIdentity || setInterval(async () => {
      let remainSeconds = this.data.remainSeconds

      remainSeconds -= 1
      if (remainSeconds <= 0) {
        remainSeconds = 30
      }

      this.setData({ remainSeconds })

      if (remainSeconds == 30) {
        await this.all()
      }
    }, 1000)
  },
  async all() {
    await wx.showLoading({title: '加载中'})

    api.all().then((response) => {
      const items: ITotpItem[] = []
      response.forEach((v: ITotpItemResponse) => {
        items.push({
          isTouchMove: false,
          ...v
        })
      })
  
      this.setData({items})
    }).catch((e) => {
      this.setData({toptipError: e.message})
    }).finally(async () => {
      await wx.hideLoading()
    })
  },
  async create() {
    this.data.isScanQrCode = true

    const scan = await wx.scanCode({scanType: ['qrCode']}).catch(() => Promise.reject(new WeixinError(CODE.WEIXIN_QR_CODE)))
    
    this.data.isScanQrCode = false
    
    api.create(scan.result).catch(async (e) => {
      this.setData({toptipError: e.message})
      await this.all()
    })
  },
  async edit(e: any) {
    this.clearInterval()

    await wx.navigateTo({url: '/pages/totp/edit?id=' + e.currentTarget.dataset.id})
  },
  async delete(e: any) {
    const result = await wx.showModal({title: '是否确定删除？', content: '删除后数据不可恢复'})

    if (result.cancel) {
      return;
    }

    api.deleteTotp(e.currentTarget.dataset.id).catch((e) => {
      this.setData({toptipError: e.message})
    }).finally(async () => {
      await this.all()
    })
  },
  clearInterval() {
    clearInterval(this.data.intervalIdentity)
    
    this.data.intervalIdentity = 0
  },
  touchstart(e: any) {
    // 开始触摸时 重置所有删除
    this.data.items.forEach(function (v: ITotpItem) {
      if (v.isTouchMove) {
        v.isTouchMove = false;
      }
    })

    // 手指触摸动作开始 记录起点X坐标
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,

      items: this.data.items
    })
  },
  touchmove(e: any) {    
    const index = e.currentTarget.dataset.index;
    const startX = this.data.startX;
    const startY = this.data.startY;
    const touchMoveX = e.changedTouches[0].clientX;
    const touchMoveY = e.changedTouches[0].clientY;
    
    // 获取滑动角度
    const angle = this.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });

    this.data.items.forEach(function (v: ITotpItem, i: number) {
      v.isTouchMove = false

      if (Math.abs(angle) > 30 || i != index) {
        return;
      }

      v.isTouchMove = touchMoveX <= startX;
    })

    this.setData({
      items: this.data.items
    })
  },
  angle(start: any, end: any) {
    const _X = end.X - start.X
    const _Y = end.Y - start.Y

    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
})

export default {}