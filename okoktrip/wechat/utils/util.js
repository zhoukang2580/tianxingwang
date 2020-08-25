const KEY_CACHED_LAUNCH_URL = "Key_Cached_Launch_Url";
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function getLaunchUrl(wx) {
  return wx.getStorageSync(KEY_CACHED_LAUNCH_URL)
};
function setLaunchUrl(launchUrl, wx) {
  wx.setStorageSync(KEY_CACHED_LAUNCH_URL, launchUrl);
}

module.exports = {
  formatTime: formatTime,
  getLaunchUrl:getLaunchUrl,
  setLaunchUrl:setLaunchUrl
}
