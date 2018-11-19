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
npm install electron-window-util --save
```
### 使用
```
import Win from 'electron-window-util'

Vue.use(Win, {
  baseUrl:'',//必填，基础url，空闲窗口预先加载的url
  // baseWindowConfig为创建窗体的初始参数，该参数与new BrowserWindow参数相同
  baseWindowConfig: {
    // frame: false,
    // transparent: false,
    // bgColor:'#fff'
  },
  router:'',//选填 vue-router
  freeWindowNum:''//空闲窗口数量
});
```
#### 打开新窗口

```
/** 支持参数
 * width 窗口宽度
 * height 窗口高度
 * x 窗口x坐标
 * y 窗口y坐标
 * resizable 是否可调节大小
 * movable 是否可移动
 * minimizable 是否可最小化
 * maximizable 是否可最大化
 * closable 是否可关闭
 * focusable 是否可聚焦
 * alwaysOnTop 是否置顶
 * fullscreen 是否全屏
 * fullscreenable 是否可全屏
 * simpleFullscreen 
 * skipTaskbar 是否不在任务栏显示
 * kiosk 是否进入kiosk模式
 * title 窗口标题
 * icon 窗口图标
 * opacity 窗口透明度
 *
 * windowConfig：{} //其他的一些配置
 */
  let res=await this.$Win.openWin({
          width: 200,
          height: 200,
          x: 0,
          y: 0,
          windowConfig: {
            router: '/landing',//如果使用路由，则在此处填写新窗口的路由
            name: 'hover',//窗口名称
            data: '鼠标悬浮',//往新窗口传递的数据
            animation: { //打开新窗口时的动画
              fromConfig: { //动画开始时的配置
                // x: 0, //动画开始时的窗口x坐标
                // y: 0, //动画开始时的窗口y坐标
                // width: 0, //动画开始时的窗口宽度
                // height: 0, //动画开始时的窗口高度
                // opacity: 0, //动画开始时的窗口透明度
              }, 
              time: 1000, // 动画持续时间
              graphs: 'Quartic.InOut' // 动画过度曲线
            },
            //time:1000, //窗口自动关闭时间，默认不关闭
          }
        });
    console.log(res);//此res为该打开窗口关闭时传来的数据
```

#### 关闭窗口
```
let pama={
    name:'', //需要关闭窗口的name
    id:'', //需要关闭窗口的id
    //id和name,二选一，若都没有则关闭调用此方法的窗口
    data:'窗口关闭时返回的数据',//窗口关闭时返回的数据
}
this.$Win.closeWin(pama);
```

#### 获取打开窗口时传递的数据
```
this.$Win.getParameter();
```

####判断窗口是否打开
```
let isOpen=this.$Win.isOpen("win1");
//true 已打开，false未打开
```


####窗口监听事件
```
  this.$Win.on('_sendMsg', (data, winInfo)=>{})
  //data，对方发来的数据
  //winInfo，发送消息的窗口信息
```

####窗口发送事件
```
  this.$Win.send('_sendMsg', {
           id: '',//接收窗口的id
           name: winName,//接收窗口的name
           //若id和name都不存在，则发送给除了自己的所有窗口
           data: this.msg,//发送的数据
         });
```
####窗口注销事件
貌似有点问题，注销不了
```
  this.$Win.off(eventName, listener);
  this.$Win.removeListener(eventName, listener);
  this.$Win.removeAllListeners(eventName);
```

