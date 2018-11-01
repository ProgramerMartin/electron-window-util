/**
 * process.type
 * 主进程 browser
 * 渲染进程 renderer
 *
 *
 * @type {Win}
 */
if (process.type === 'browser') module.exports = require('./util/windowUtil');
// if (process.type === 'renderer') module.exports = require('./render');
if (process.type === 'renderer') module.exports = require('./util/renderUtil');


/**
 * width
 * height
 * x
 * y
 * center
 * resizable
 * movable
 * minimizable
 * maximizable
 * closable
 * focusable
 * alwaysOnTop
 * fullscreen
 * fullscreenable
 * simpleFullscreen
 * skipTaskbar
 * kiosk
 * title
 * icon
 * opacity
 */
