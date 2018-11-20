const electron = require('electron');
const util = require('../util/util');
const {BrowserWindow, screen} = electron;

class mainProcess {
  constructor(config) {

    this.freeWindowNum = config.freeWindowNum || 1;
    this.baseUrl = config.baseUrl || '';
    // this.url = '';
    this.useRouter = config.useRouter;
    this.baseWindowConfig = {
      transparent: true,
      frame: false,
      // frame: true,
      // center: true,
      width: 0,
      height: 0,
      opacity: 0,
      // webPreferences: {
      //   webSecurity: process.env.NODE_ENV === 'production'
      // }
      ...config.baseWindowConfig,
      show: false,
    };
    this._windowList = []; // 窗口容器


    // 单例模式
    if (mainProcess.prototype.__Instance === undefined) {
      mainProcess.prototype.__Instance = this;
      this.checkFreeWindow();
    }
    return mainProcess.prototype.__Instance;
  }

  openWin(option) {
    option = option || {};
    option.windowConfig = option.windowConfig || {animation: {}};
    option.windowConfig.fromWinId = "";

    let win = this.getFreeWindow(option);
    let winId = win.id;
    if (option.windowConfig.time) {
      setTimeout(() => {
        this.closeWinByWinId(winId);
      }, option.windowConfig.time);
    }
    win.show();

    return win;
  }

  closeWin(option = {}) {
    let winInfo;
    if (option.id) {
      winInfo = this.getWinInfoById(option.id);
    } else if (option.name) {
      winInfo = this.getWinInfoByName(option.name);
    }

    console.log(winInfo)

    if (winInfo) {
      //发送消息
      winInfo.backMsg = option.data;
      //关闭窗口
      this.closeWinByWinId(winInfo.id)
    }
  }

  updateWindowList(arg) {
    let win = this._windowList.find(item => item.id === arg.id);
    if (win) return;
    // 设置传参
    this._windowList.push({
      id: arg.id,//窗口id
      name: '',//窗口name
      isUse: true,//是否正在使用
      url: '',//url
      router: '',//router
      sendMsg: '',//打开窗口时传递的数据
      backMsg: '',//关闭窗口时传递的数据
      fromWinId: '',//来源窗口id
      reuse: false,//是否复用
    });
  }

  checkFreeWindow() {
    // 如果有缓存，查找空余窗口是否足够，不足的话创建到给定水平
    let notUseWindowNum = this._windowList.filter(win => !win.isUse).length;
    let num = this.freeWindowNum - notUseWindowNum;
    if (num > 0) {
      for (let i = num; i > 0; i--) {
        this.creatFreeWindow() // 暂时循环调用，后期用延时
      }
    }
  }

  creatFreeWindow() {
    let win = new BrowserWindow(this.baseWindowConfig);
    // 设置传参
    this._windowList.push({
      id: win.id,//窗口id
      name: '',//窗口name
      isUse: false,//是否正在使用
      url: '',//url
      router: '',//router
      sendMsg: '',//打开窗口时传递的数据
      backMsg: '',//关闭窗口时传递的数据
      fromWinId: '',//来源窗口id
      reuse: false,//是否复用
    });
    let winId = win.id;

    win.on('closed', () => {// 先push出数组

      // let backMsg = '';
      // let winInfo = this.getWinInfoById(winId);
      // if (winInfo) backMsg = winInfo.backMsg;

      // this.sendById(winInfo.fromWinId, `_closed${winId}`, backMsg);

      this._windowList = this._windowList.filter(item => item.id !== winId);
    });

    win.loadURL(this.baseUrl);

    return win;
  }

  getFreeWindow(option) {
    option = option || {};
    let freeWindow, freeWindowInfo;
    if (option.windowConfig.name) {
      let winInfo = this._windowList.find(item => item.name === option.windowConfig.name);

      if (winInfo) {
        freeWindow = BrowserWindow.fromId(winInfo.id);
        freeWindowInfo = winInfo;
        if (freeWindowInfo.reuse) {
          if (freeWindowInfo.isUse) {
            if (option.windowConfig.reload) {
              this.windowRouterChange(freeWindow, option.windowConfig);
              this.refreshFreeWindowInfo(freeWindowInfo, option)
            }
          } else {
            // 路由跳转
            this.windowRouterChange(freeWindow, option.windowConfig);
            // 窗口基础状态
            this.setWindowConfig(option, freeWindow);
            // 如果有动画生成动画后状态
            if (option.windowConfig.animation) {
              this.animation(freeWindow, this.getAnimationConfig(option))
            }
            // 更新队列
            this.refreshFreeWindowInfo(freeWindowInfo, option)
          }
        } else {
          if (option.windowConfig.reload) {
            this.windowRouterChange(freeWindow, option.windowConfig);
            this.refreshFreeWindowInfo(freeWindowInfo, option)
          }
        }
      } else {
        freeWindowInfo = this._getFreeWindow();
        freeWindow = BrowserWindow.fromId(freeWindowInfo.id);
        // 窗口基础状态
        this.setWindowConfig(option, freeWindow);
        // 如果有动画生成动画后状态
        if (option.windowConfig.animation) {
          this.animation(freeWindow, this.getAnimationConfig(option))
        }
        // 路由跳转
        this.windowRouterChange(freeWindow, option.windowConfig);
        // 更新队列
        this.refreshFreeWindowInfo(freeWindowInfo, option);
        this.checkFreeWindow()
      }
    } else {
      // 拉出窗口
      freeWindowInfo = this._getFreeWindow();
      freeWindow = BrowserWindow.fromId(freeWindowInfo.id);
      // 窗口基础状态
      this.setWindowConfig(option, freeWindow);
      // 如果有动画生成动画后状态
      if (option.windowConfig.animation) {
        this.animation(freeWindow, this.getAnimationConfig(option))
      }
      // 路由跳转
      this.windowRouterChange(freeWindow, option.windowConfig);
      // 更新队列
      this.refreshFreeWindowInfo(freeWindowInfo, option);
      this.checkFreeWindow();
    }
    return freeWindow;
  }

  windowRouterChange(win, config) {
    let url = config.url;
    let router = config.router;
    if (this.useRouter) this.sendById(win.id, '_changeRouter', router);
    // if (win.webContents.isLoading()) {
    //   win.webContents.once('did-finish-load', () => {
    //     if (this.useRouter) this.sendMsg(win.id, '_changeRouter', router);
    //   });
    // } else {
    //   if (this.useRouter) this.sendMsg(win.id, '_changeRouter', router);
    // }
  }

  animation(win, animationConfig) {
    if (util.isObjectValueEqual(animationConfig.fromConfig, animationConfig.toConfig)) return;
    this.sendById(win.id, '_animation', animationConfig);
  }

  /*
 * @desc 重新设置窗口的基础属性
 * 目前需要手动调整的后期根据需求加入
 * @param {object} config:{width, height, minimizable, maximizable, resizable, x, y, center, alwaysOnTop, skipTaskbar}
 */
  setWindowConfig(config, freeWindow) {

    // freeWindow.setSize(800, 600);

    let animationConfig = this.getAnimationConfig(config);

    let option = config.windowConfig.animation ? animationConfig.fromConfig : animationConfig.toConfig;

    // 设置窗口的不透明度，在Linux系统上无效
    freeWindow.setOpacity(option.opacity);
    // return

    // if (config.hasOwnProperty('width') && config.hasOwnProperty('height')) {
    // 设置窗口大小
    freeWindow.setSize(option.width, option.height);
    // }

    // 将窗口移动到 x 和 y。
    // if (config.hasOwnProperty('x') && config.hasOwnProperty('y')) {
    freeWindow.setPosition(option.x, option.y);
    // } else {
    //   // freeWindow.center();
    // }


    // 设置用户是否可以手动调整窗口大小。
    if (config.hasOwnProperty('resizable')) freeWindow.setResizable(config.resizable);
    // 设置窗口是否可由用户移动。在 Linux 上无效。
    if (config.hasOwnProperty('movable')) freeWindow.setMovable(config.movable);
    // 设置窗口是否可以最小化. 在 Linux 上无效.
    if (config.hasOwnProperty('minimizable')) freeWindow.setMinimizable(config.minimizable);
    // 设置窗口是否可以最大化. 在 Linux 上无效.
    if (config.hasOwnProperty('maximizable')) freeWindow.setMaximizable(config.maximizable);
    // 设置窗口是否可以人为关闭。在 Linux 上无效.
    if (config.hasOwnProperty('closable')) freeWindow.setClosable(config.closable);
    // 设置窗口是否应始终显示在其他窗口的顶部。设置之后, 仍然是一个普通窗口, 而不是一个无法聚焦的工具箱窗口。
    if (config.hasOwnProperty('alwaysOnTop')) freeWindow.setAlwaysOnTop(config.alwaysOnTop);
    // 设置是否全屏
    if (config.hasOwnProperty('fullscreen')) freeWindow.setFullScreen(config.fullscreen);
    // 设置点击最大化按钮是否可以全屏或最大化窗口.
    if (config.hasOwnProperty('fullscreenable')) freeWindow.setFullScreenable(config.fullscreenable);
    // 使窗口不显示在任务栏中。
    if (config.hasOwnProperty('skipTaskbar')) freeWindow.setSkipTaskbar(config.skipTaskbar);
    // 进入或离开 kiosk 模式。
    if (config.hasOwnProperty('kiosk')) freeWindow.setKiosk(config.kiosk);
    // 将原生窗口的标题更改为 title。
    if (config.hasOwnProperty('title')) freeWindow.setTitle(config.title);
    // 设置窗口图标
    if (config.hasOwnProperty('icon')) freeWindow.setIcon(config.icon);
    // 设置窗口是否可聚焦
    if (config.hasOwnProperty('focusable')) freeWindow.setFocusable(config.focusable);
    // 进入或离开简单的全屏模式。
    if (config.hasOwnProperty('simpleFullscreen')) freeWindow.setSimpleFullScreen(config.simpleFullscreen)
  }

  /*
   * @desc 获取结束动画配置
   *
   */
  getAnimationConfig(option) {

    let animation = option.windowConfig.animation || {};

    let fromConfig = animation.fromConfig || {};

    let workAreaSize = this.getScreenInfo().workAreaSize;

    let width = option.width !== undefined ? option.width : 800;
    let height = option.height !== undefined ? option.height : 600;

    let centerX = (workAreaSize.width - width) / 2;
    let centerY = (workAreaSize.height - height) / 2;
    let config = {
      toConfig: {
        x: option.x !== undefined ? option.x : centerX,
        y: option.y !== undefined ? option.y : centerY,
        width: option.width !== undefined ? option.width : width,
        height: option.height !== undefined ? option.height : height,
        opacity: option.opacity !== undefined ? option.opacity : 1,
      }
    };
    config.fromConfig = {
      ...config.toConfig,
      ...fromConfig,
    };
    config.time = animation.time || 1000;
    config.graphs = animation.graphs || 'Exponential.Out';

    return config;
  }

  /*
 * 取出一个空白窗口并且返回（仅仅取出对象）
 */
  _getFreeWindow() {
    // 没有使用的窗口并且不是复用的窗口
    let winInfo = this._windowList.find(row => row.isUse === false && !row.reuse);
    if (!winInfo) {
      let win = this.creatFreeWindow();
      return this._windowList.find(row => row.id === win.id);
    }
    return winInfo
  }

  /*
 * @desc 更新队列
 */
  refreshFreeWindowInfo(freeWindowInfo, option) {
    freeWindowInfo.url = option.windowConfig.url;
    freeWindowInfo.router = option.windowConfig.router;
    freeWindowInfo.sendMsg = option.windowConfig.data;
    freeWindowInfo.isUse = true;
    freeWindowInfo.name = option.windowConfig.name;
    freeWindowInfo.fromWinId = option.windowConfig.fromWinId;
    freeWindowInfo.reuse = option.windowConfig.reuse || false;
    this.setUseWindow(freeWindowInfo)
  }

  /*
 * 根据窗口id设置某一窗口为已使用
 */
  setUseWindow(freeWindowInfo) {
    this._windowList = this._windowList.map(row => {
      return row.id === freeWindowInfo.id ? freeWindowInfo : row
    })
  }

  getWinByName(WinName) {
    if (!WinName) return;
    let winInfo = this._windowList.find(item => item.name === WinName);
    if (winInfo) {
      return BrowserWindow.fromId(winInfo.id);
    }

  }

  getWinById(winId) {
    if (!winId) return;
    return BrowserWindow.fromId(winId);
  }

  getWinInfoByName(WinName) {
    if (!WinName) return;
    return this._windowList.find(item => item.name === WinName);
  }

  getWinInfoById(winId) {
    if (!winId) return;
    return this._windowList.find(item => item.id === winId);
  }

  getScreenInfo() {
    return screen.getPrimaryDisplay();
  }

  send(eventName, arg) {
    if (!arg) throw new Error('参数是必须的');
    if (arg.constructor !== Object) throw new Error("参数必须为对象");
    if (!arg.data) throw new Error('参数中必须包含要发送的消息');

    let msg = {
      winInfo: {},
      data: arg.data
    };

    if (arg.fromWinId) {
      let winInfo = this.getWinInfoById(arg.fromWinId);
      if (winInfo) msg.winInfo.name = winInfo.name;
      msg.winInfo.id = arg.fromWinId;
    }

    if (arg.id) {
      return this.sendById(arg.id, eventName, msg);
    }
    else if (arg.name) {
      return this.sendByName(arg.name, eventName, msg);
    }
    else {
      this._windowList.forEach(item => {
        if (item.id === arg.fromWinId) return;
        this.sendById(item.id, eventName, msg);
      });
      return true;
      //向所有窗口发送数据，除了本窗口
    }
  }

  sendById(winId, eventName, arg) {
    let win = BrowserWindow.fromId(winId);
    if (!win) return false;
    win.webContents.send(eventName, arg);
    return true;
  }

  sendByName(winName, eventName, arg) {
    let winInfo = this.getWinInfoByName(winName);
    if (!winInfo) return false;
    return this.sendById(winInfo.id, eventName, arg);
  }

  /**
   * 关闭win
   * @param win
   */
  exitWin(win) {
    win.close();
  }

  /**
   * 隐藏win
   * @param win
   */
  hideWin(win) {
    let winInfo = this.getWinInfoById(win.id);
    // this.sendById(winInfo.fromWinId, `_closed${win.id}`, '');
    win.hide();
  }

  /**
   * 通过id关闭win
   * @param id
   */
  closeWinByWinId(id) {
    let winInfo = this.getWinInfoById(id);
    if (!winInfo) return;
    let win = BrowserWindow.fromId(winInfo.id);
    if (winInfo.reuse) this.hideWin(win);
    else this.exitWin(win);
  }

  /**
   * 通过name关闭win
   * @param name
   */
  closeWinByWinName(name) {
    let winInfo = this.getWinInfoByName(name);
    if (!winInfo) return;
    let win = BrowserWindow.fromId(winInfo.id);
    if (winInfo.reuse) this.hideWin(win);
    else this.exitWin(win);
  }

  isOpen(winName) {
    if (!winName) return false;
    let winInfo = this.getWinInfoByName(winName);
    if (!winInfo) return false;
    return winInfo.isUse;
  }
}


module.exports = mainProcess;
