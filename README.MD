electron的多窗口模块，可以快速的打开多个electron窗口
正在完善中，方法可能会修改（废弃与新增）  
已知bug：  
 1、窗口打开过多会造成新窗口vue不加载，初步估计可能和vue相关  
 2、窗口间通信，事件不能注销
#### [模块github地址](https://github.com/zsj975516/electron-window-util)
#### [模块demo地址](https://github.com/zsj975516/electron-window-util-demo)
#### [问题反馈](https://github.com/zsj975516/electron-window-util/issues)

### 安装
使用npm安装模块
```
//安装模块
npm i electron-window-util

//项目中使用
import Vue from 'vue'
import router from './router'

const electron = require('electron');
const winUtil = require('electron-window-util');

let baseUrl = electron.remote.getGlobal('baseUrl');

let win = new winUtil({
  baseUrl: baseUrl,
  router: router
});
Vue.prototype.$Win = win;
```



###  ``new winUtil(option)``  
* ``option`` Object  
    * ``baseUrl`` String 空闲窗口预加载地址
    * ``baseWindowConfig`` Object 基本的窗口配置，与electron的``new BrowserWindow()``是参数一致
    * ``router`` vueRouter vue-router
    * ``freeWindowNum`` number 预备空闲窗口个数


#  方法
``渲染进程`` 具有以下方法

###  ``win.openWin([option])``  
* ``option`` Object(可选)  
  *  ``width``  number
  *  ``height``  number
  *  ``x``  number
  *  ``y``  number
  *  ``resizable``  boolean
  *  ``movable``  boolean
  *  ``minimizable``  boolean
  *  ``maximizable``  boolean
  *  ``closable``  boolean
  *  ``focusable``  boolean
  *  ``alwaysOnTop``  boolean
  *  ``fullscreen``  boolean
  *  ``fullscreenable``  boolean
  *  ``simpleFullscreen``  boolean
  *  ``skipTaskbar``  boolean
  *  ``kiosk``  boolean
  *  ``title``  string
  *  ``icon``  
  *  ``opacity``  number
  *  ``windowConfig``  object
     *  ``router``  string|object vue路由，如``/my_route``,``{path:"/my_route"}``,``{name:"my_route"}``等
     *  ``name``  string（可选） 若不存在可打开N个，若存在只能打开一个
     *  ``data``  any（可选） 窗口打开时传递过去的参数
     *  ``animation`` object（可选） 动画配置
        * ``fromConfig`` object（可选） 动画开始时的配置
            * ``x``  number 动画开始时的x坐标
            * ``y``  number 动画开始时的y坐标
            * ``width``  number 动画开始时的窗口宽度
            * ``height``  number 动画开始时的窗口高度
            * ``opacity``  number  动画开始时的窗口透明度
        * ``time``  number 动画过渡时间
        * ``graphs``  string 动画过渡曲线
     *  ``time``  number 窗口自动关闭时间，为0或undefined时不关闭
  
打开一个新窗口，如果没有name直接打开一个新窗口，如果有name，则判断是否有此name的窗口存在，有就激活该窗口


###  ``win.closeWin([option|winName])``  

*  ``option``  object（可选） 
    * ``name``  要关闭窗口的name
    * ``id``  要关闭窗口的id，若既没有name也没有id，则关闭调用此方法的窗口  
    ~~ * ``data``  关闭窗口时回传的数据，暂不可用~~
    
  *  ``winName`` string（可选） 窗口的name
  
关闭窗口  



###  ``win.isOpen([winName])``  
*  ``winName``  

返回``Boolean``类型-如果窗口已打开返回``true``，其余情况返回``false``  



###  ``win.on(channel,listener)``  
*  ``channel``  String
*  ``listener``  Function

监听``channel``，当接收到新的消息时 ``listener`` 会以 ``listener(data, winInfo)`` 的形式被调用。  



###  ``win.send(channel,sendMsg)``  
*  ``channel``  String
*  ``sendMsg``  Object
    * ``id`` 接收消息窗口的id
    * ``name`` 接收消息窗口的name，若id和name都没有，则发给所有窗口
    * ``data`` 

通过 ``channel`` 发送异步消息到主进程，可以携带任意参数。 在内部，参数会被序列化为 ``JSON``，因此参数对象上的函数和原型链不会被发送。


###  ``win.off(channel,listener)``  
*  ``channel``  String  
*  ``listener``  Function  

为特定的 ``channel`` 从监听队列中删除特定的 ``listener`` 监听者.

###  ``win.removeListener(channel,listener)``  
*  ``channel``  String  
*  ``listener``  Function  

为特定的 ``channel`` 从监听队列中删除特定的 ``listener`` 监听者.

###  ``win.removeAllListeners(channel)``  
*  ``channel``  String  

移除所有的监听器，当指定 ``channel`` 时只移除与其相关的所有监听器。

以上三个貌似有点问题，注销不了

#  属性  

``渲染进程`` 具有以下属性

###  ``win.parameter``  

获取打开窗口时传递的数据  

###  ``win.winInfo``  

窗口的信息，包括坐标位置和宽高  

###  ``win.screenInfo``  

屏幕信息  
