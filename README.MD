electron的多窗口模块，可以快速的打开多个electron窗口
```
npm install electron-window-util --save
```
```
import Win from 'electron-window-util'

Vue.use(Win, {
  baseUrl:'',//基础url，空闲窗口预先加载的url
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
