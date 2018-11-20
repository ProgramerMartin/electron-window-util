// const events = require('events');
const electron = require('electron');
const {remote, ipcRenderer} = electron;
const TWEEN = require('../util/Tween');

const windowUtil = remote.require('electron-window-util');

class renderProcess {
  constructor(config = {}) {
    this.win = remote.getCurrentWindow();
    // this.eventBus = new events.EventEmitter();
    this.router = config.router;
    this.baseUrl = config.baseUrl;
    config.useRouter = !!this.router;
    this.windowUtil = new windowUtil(config);

    this.addEventListenerForWindow(config);
  }

  addEventListenerForWindow(config = {}) {
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

    return this.windowUtil.openWin(option);
  }

  closeWin(option = {}) {

    if (typeof option === 'string') {
      option = {name: option};
    }

    if (!option.id && !option.name) {
      option.id = this.win.id;
    }

    this.windowUtil.closeWin(option)
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

  isOpen(winName) {
    return this.windowUtil.isOpen(winName);
  }

  get parameter() {
    let winId = this.win.id;
    let winInfo = this.windowUtil._windowList.find(item => item.id === winId);
    if (!winInfo) return
    return winInfo.sendMsg;
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

module.exports = renderProcess;

// exports.default = (Vue, option) => {
// // export default (Vue, option) => {
//   let router = option.router;
//   let config = {
//     baseUrl: option.baseUrl,
//     baseWindowConfig: option.baseWindowConfig,
//     freeWindowNum: option.freeWindowNum,
//     useRouter: !!router,
//   };
//
//   let Win = new renderProcess();
//
//   Win.init(config, router);
//
//   Vue.prototype.$Win = Win;
// }

// module.exports = new renderProcess();
// export default new renderProcess();
