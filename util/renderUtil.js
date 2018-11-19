Object.defineProperty(exports, "__esModule", { value: true });
const events = require('events');
const electron = require('electron');
const {remote, ipcRenderer} = electron;
const TWEEN = require('./Tween')

const windowUtil = remote.require('electron-window-util');

class renderUtil {
  constructor() {
    this.eventBus = new events.EventEmitter();
    this.baseUrl = '';
    this.router = '';
    this.win = remote.getCurrentWindow();
    this.windowUtil = null;
    // console.log(remote.getCurrentWindow())
  }

  init(config, router) {
    this.router = router;
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (!this.windowUtil) {
      config.useRouter = !!router;
      this.windowUtil = new windowUtil(config);
    }
    this.addEventListenerForWindow();
    this.windowUtil.updateWindowList({id: this.win.id});
    console.log('当前窗口个数', this.windowUtil._windowList.length - 1)
  }

  addEventListenerForWindow() {
    // 监听路由变化
    ipcRenderer.on('_changeRouter', (event, arg) => {
      this.router.push(arg);
    });
    // 动画监听
    ipcRenderer.on('_animation', (event, animationConfig) => {
      console.log('_animation')
      this.animation(animationConfig);
    });
  }

  animation(animationConfig) {

    let animateId;

    function animate(time) {
      animateId = requestAnimationFrame(animate);
      TWEEN.update(time);
    }

    TWEEN.removeAll();
    let tween = new TWEEN.Tween({
      x: animationConfig.fromConfig.x,
      y: animationConfig.fromConfig.y,
      width: animationConfig.fromConfig.width,
      height: animationConfig.fromConfig.height,
      opacity: animationConfig.fromConfig.opacity,
    })
      .to({
        x: animationConfig.toConfig.x,
        y: animationConfig.toConfig.y,
        width: animationConfig.toConfig.width,
        height: animationConfig.toConfig.height,
        opacity: animationConfig.toConfig.opacity,
      }, animationConfig.time)
      .onUpdate(a => {
        console.log(
          parseInt(a.x), parseInt(a.y),
          parseInt(a.width), parseInt(a.height),
          a.opacity);
        this.win.setPosition(parseInt(a.x), parseInt(a.y));
        this.win.setSize(parseInt(a.width), parseInt(a.height));
        this.win.setOpacity(a.opacity);
      }).onComplete(() => {
        cancelAnimationFrame(animateId);
      }).start();
    let graphs = animationConfig.graphs.split('.');
    tween.easing(TWEEN.Easing[graphs[0]][graphs[1]]);
    animate();
  }

  openWin(option) {
    option = option || {};
    option.windowConfig = option.windowConfig || {animation: {}};
    option.windowConfig.fromWinId = this.win.id;

    let win = this.createWin(option);
    let winId = win.id;
    if (option.windowConfig.time) {
      setTimeout(() => {
        this.windowUtil.closeWinByWinId(winId);
      }, option.windowConfig.time);
    }
    win.show();
    return new Promise((resolve, reject) => {
      // 监听关闭窗口前发送来的数据
      ipcRenderer.once(`_closed${winId}`, (event, backMsg) => {
        resolve(backMsg);
      });
    });
  }

  closeWin(arg) {
    if (!arg) {
      this.windowUtil.closeWinByWinId(this.win.id);
    } else if (arg.constructor === String) {
      let win = this.getWinByName(arg);
      if (win) this.windowUtil.closeWinByWinId(win.id);
    } else if (arg.constructor === Object) {

      let winInfo = '';
      if (arg.id) {
        winInfo = this.getWinInfoById(arg.id);
      } else if (arg.name) {
        winInfo = this.getWinInfoByName(arg.name);
      } else {
        winInfo = this.getWinInfoById(this.win.id);
      }
      if (winInfo) {
        //发送消息
        winInfo.backMsg = arg.data;
        //关闭窗口
        this.windowUtil.closeWinByWinId(winInfo.id)
        // let win = this.getWinById(winInfo.id);
        // if (win) win.close();
      }
    }
  }

  getWinByName(winName) {
    return this.windowUtil.getWinByName(winName);
  }

  getWinById(winId) {
    return this.windowUtil.getWinById(winId);
  }

  getWinInfoByName(winName) {
    return this.windowUtil.getWinInfoByName(winName);
  }

  getWinInfoById(winId) {
    return this.windowUtil.getWinInfoById(winId);
  }

  getParameter() {
    let winId = this.win.id;
    let winInfo = this.windowUtil._windowList.find(item => item.id === winId);
    if (!winInfo) return
    return winInfo.sendMsg;
  }

  getScreenInfo() {
    return this.windowUtil.getScreenInfo();
  }

  createWin(option) {
    option = option || {};
    option.windowConfig = option.windowConfig || {animation: {}};
    option.windowConfig.fromWinId = this.win.id;
    return this.windowUtil.getFreeWindow(option)

  }

  send(eventName, arg) {
    arg = arg || {};
    arg.fromWinId = this.win.id;
    return this.windowUtil.send(eventName, arg);
  }

  on(eventName, listener) {
    ipcRenderer.on(eventName, (event, arg) => {
      if (arg && arg.data) listener(arg.data, arg.winInfo);
      else listener(event, arg);
    });
  }

  once(eventName, listener) {
    ipcRenderer.once(eventName, (event, arg) => {
      listener(arg.data, arg.winInfo);
    });
  }

  off(eventName, listener) {
    ipcRenderer.removeListener(eventName, listener)
  }

  removeListener(eventName, listener) {
    ipcRenderer.removeListener(eventName, listener)
  }

  removeAllListeners(eventName) {
    ipcRenderer.removeAllListeners(eventName)
  }

  get winInfo() {
    return this.win.getBounds();
  }

  get screenInfo() {
    return this.windowUtil.getScreenInfo();
  }

  get allWin() {
    return this.windowUtil._windowList;
  }

}
exports.default =  (Vue, option) => {
// export default (Vue, option) => {
  let router = option.router;
  let config = {
    baseUrl: option.baseUrl,
    baseWindowConfig: option.baseWindowConfig,
    freeWindowNum: option.freeWindowNum,
    useRouter: !!router,
  };

  let Win = new renderUtil();

  Win.init(config, router);

  Vue.prototype.$Win = Win;
}

// module.exports = new renderUtil();
// export default new renderUtil();
