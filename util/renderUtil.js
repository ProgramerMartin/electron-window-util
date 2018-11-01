const events = require('events');
const electron = require('electron');
const {remote, ipcRenderer} = electron;

const VueRouter = require('vue-router')
const TWEEN = require('@tweenjs/tween.js')


const windowUtil = remote.require('winUtil');

console.log(windowUtil)

class renderUtil {
  constructor() {
    this.baseUrl = '';
    this.router = '';
    this.win = remote.getCurrentWindow();
    this.windowUtil = null;
    this.eventBus = new events.EventEmitter();
    // console.log(remote.getCurrentWindow())
  }

  init() {
    let config = {}, router;
    let args = [...arguments];
    if (args.length === 1) {
      if (args[0].constructor === Object) {
        config = args[0];
      } else if (args[0].constructor === VueRouter) {
        router = args[0];
      }
    } else if (args.length === 2) {
      if (args[0].constructor === Object && args[1].constructor === VueRouter) {
        config = args[0];
        router = args[1];
      } else if (args[1].constructor === Object && args[0].constructor === VueRouter) {
        config = args[1];
        router = args[0];
      }
    }
    this.router = router;
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (!this.windowUtil) {
      config.eventBus = this.eventBus;
      config.useRouter = !!router
      this.windowUtil = new windowUtil(config);
    }
    this.addEventListenerForWindow();
    console.log('初始化', config, router)
  }

  addEventListenerForWindow() {
    // 监听路由变化
    ipcRenderer.on('_changeRouter', (event, arg) => {
      this.router.push(arg);
    });
    // 监听路由变化
    ipcRenderer.on('_animation', (event, animationConfig) => {
      this.animation(animationConfig);
    });
  }

  animation(animationConfig) {

    console.log('animationConfig', animationConfig)
    let animateId;

    function animate(time) {
      animateId = requestAnimationFrame(animate);
      TWEEN.update(time);
    }

    TWEEN.removeAll();
    let win = this.win;
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
      .onUpdate(function (a) {
        console.log(
          parseInt(a.x), parseInt(a.y),
          parseInt(a.width), parseInt(a.height),
          a.opacity);
        win.setPosition(parseInt(a.x), parseInt(a.y));
        win.setSize(parseInt(a.width), parseInt(a.height));
        win.setOpacity(a.opacity);
      }).onComplete(function () {
        cancelAnimationFrame(animateId);
      }).start();
    let graphs = animationConfig.graphs.split('.');
    tween.easing(TWEEN.Easing[graphs[0]][graphs[1]]);
    animate();
  }

  openWin(option) {
    option = option || {};
    let win = this.createWin(option);
    if (option.time) {
      setTimeout(() => {
        win.close();
      }, option.time)
    }
    win.show();
    let winId = win.id;
    return win;
  }

  closeWin() {
    let args = [...arguments];
    let winName = '';
    let win;
    if (!args.length) {
      win = this.win;
    } else if (args.length === 1) {
      if (args[0].constructor === String) {
        winName = args[0];
      } else if (args[0].constructor === Array) {

      } else if (args[0].constructor === Object) {
        if (!args[0].hasOwnProperty('name')) return;
        winName = args[0].name;
        if (args[0].hasOwnProperty('data')) {
          //返回数据
        }
      } else {
        win = args[0];
      }
    }

    if (!win && winName) win = this.getWinByName(winName);
    if (win) win.close();
  }

  getWinByName(winName) {
    return this.windowUtil.getWinByName(winName);
  }

  getCurrentWin() {
    return this.win;
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
    option.windowConfig = option.windowConfig || {animation: {}};

    return this.windowUtil.getFreeWindow(option)

  }
}


// module.exports = new renderUtil();
export default new renderUtil();
