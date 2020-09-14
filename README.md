# 手机端架构规划
## 登录模块
## 账号管理模块
## 权限模块
### 验证是否登录
### 添加统一的头部信息，如token
## 多语言模块
## 工具
### 通用的方法封装
## 通用api调用
## 公共组件模块
## 插件模块

登录：
  1.用户名、密码，如果输错2次，请求验证码(调用api)，不区分大小写
  2.手机验证码登录,倒计时,如果输错2次，请求验证码
  3.微信登录、钉钉登录
  4.设备登录（用于自动登录）
## mac上的注意事项
1. 拉取代码后，需要执行npm i，如果要用到热更功能，需要先安装cordova-plugin-zip 插件，随后可选择安装，cordova-plugin-file 插件，zip插件依赖file插件，所以会自动安装，否则ios的热更不起作用
2. 打包编译指令 sudo ionic cordova build ios --prod 
3. 用xcode 打开项目前 需要先执行下 sudo chmod -R 777 ./platforms/ios 改变文件夹属性，否则打开xcode会不能修改里面的信息
## 开发阶段，改变localhost:4200为指定的域名地址
  `ng serve --host 域名 --port 端口号 --open` 其中的默认端口号是4200
  例如：
  `ng serve --host dev.app.beeant.com --port 4500 --open`
  `ng serve --vendorChunk=true --sourceMap=false --optimization=false --hmr=true --commonChunk=true --disableHostCheck`
## 开发阶段使用热加载模块，提高编译速度
  `ng serve --hmr`
## 关于路由的简单逻辑
1. 路由跳转，如果有定义这个路由，说明页面存在，或者，如果新增某个风格的页面，路由也是存在的，所以，一旦路由不存在，则跳转到默认路由
2. 路由的路径统一跳转，需要注意格式，每个路由定义的规则是，标准路由名称_style_language，即，标准路由名称定义第一个，后面是不同风格和语言的路由定义
3. 路径统一由AppHelper.getRoutePath(标准模块的路由)
# 注意事项：
  ng 8.2版本的标准路由导入，loadChildren:()=>import(xxx).then(m=>m.xxx)
  import里面的路径不能用“``”字符串引号，因为prod打包后，跳转路由报错，Runtime compiler is not loaded 
## 模块、页面命名及层级
所有的模块单独一个文件夹
所有的模块下面的功能界面名称用改模块名称做前缀
所有的模块功能界面下面的子页面，名字用杠(-)分割，和功能模块子页面平级，前缀是当前功能子页面的页面名称
比如，account 模块，
--- account
   |----account-password 该页面是account模块下面的修改密码功能页面
   |----account-password-by-sms-code 该页面是account-password的子页面
文件单词以-切分，比如，account.service, mms-order.service
service 以.service 结尾，文件名以 - 切分 比如 mms-shopcart.service
页面名称和对应的ts文件的class名一致，页面对应的路由和页面的名称保持一致
   
简单理解，就是要前缀一致

## 更新app和热更新的逻辑
`Main.Minor.Patch` --主版本.次版本.热更新版本
记录在config.xml文件内
1. 主版本和次版本不变，就不用更新app
2. (1)的情况下，查看人更新的版本号，检查本地目录是否已经存在，不存在该热更新版本，则下载更新，新增一个目录名称，存放新文件，下次启动后加载新目录的文件

## 更新app过程
1. 到config.xml修改版本号，修改主、次版本号需要重新发布到appstore或者安卓市场，如果修改的是热更版本号，也就是最后一位，则不需要重新发布应用
2. 执行生产环境打包，生产android的apk，用mac打包，生成iphone的app，分别发布到市场
3. 如果不需要发布应用，仅发布热更，先用生成apk的命令正常打包，然后在项目目录下找到xxx.xxx.android.hash.zip的文件，ios则是 包名.ios.hash.zip，将文件复制到service.version站点的download目录下面（删除就的zip文件，或者重命名），并且将文件名的hash剪切，将这个hash复制到Applications下面对应的 xxx.android.json或者xxx.ios.json文件的MD5对应的地方，注意，不是apkmd5,apkmd5是更新apk时候，用于校验apk的hash值用的。最后将版本号修改即可。注意看config.xml里面的版本号前两位，需要保持一致，最后一位是热更新用的，增加最后一位即可。
4. 最后修改updateList.xml修改对应的配置项。其中的Value=config.xml的版本号，其中的version节点对应Android的apk更新，其内部的hotfix对应热更的www目录。md5的值在编译生成的output目录的xxx.apk路径中很长的一段字符串就是对应的md5
5. 非常重要的注意点，如果是ios热更，一定要用mac进行build ios 生成的 xxx.ios.zip文件，否则更新失败！！！
6. 由于历史原因，生产的iOS热更新文件的json名字是 `com.eskytrip.zhaozuomingios.ios.json`,下载的文件名字根据json文件内部指定名字即可。
7. mac上打包时候，到target里面的info找到plist文件，添加微信的白名单 weixinULAPI
8. 在平果开发者中心，找到Identifiers，应用管理中，勾上Associated Domains
## 发布
`ng build --prod --base-href /www/`
ng serve --disableHostCheck

## 修改wechat app id 
1. 到项目目录下面找到config.xml，找到里面的 `<preference name="WECHATAPPID" value="wx58e8910e60cd69ac" />`
2. 将其值修改对应的appid即可
3. ios微信配置，请参考官网：`https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/iOS.html`
## ios 发布app说明
执行命令前，先到config.xml修改版本号
0. 确定打包的环境变量值，environment里面的测试/生产环境，environment.prod.ts
1. 首先执行 `sudo ionic cordova build ios --prod --release`
2. 用 xcode 打开 platforms/ios/项目名称.xcodeproj/项目名称.xcworkspace
3. 到xcode target 的选项卡中打开 info，修改打包的bundle identifier为： `com.eskytrip.zhaozuomingios`，如果要修改微信appid ,修改最底下的url types 的schema `https://pay.weixin.qq.com/wiki/doc/api/app/app.php?chapter=8_5`,位置访问，需要在info标签下面新增 key =`Privacy - Location Always Usage Description`和`Privacy - Location Usage Description`
4. 执行archive打包，传到iTunes,提交审核
## 支付宝唤起
在xcode打包时候，找到 info，找到 LSApplicationQueriesSchemes 添加 alipay ，alipays
## 微信唤起
在xcode打包时候，找到 info，找到 LSApplicationQueriesSchemes 添加 weixinULAPI
在info标签下，找到最下面的URL Types 添加 微信的 url type wechat 或者 weixin 否则跳转微信后无法返回APP
## 热更新打包
1. 确定环境变量
2. 执行打包命令
3. 如果发现命令行出现 ARCHIVE FAILED 的提示，则需要手动生成一个md5值
  a. 到项目目录下面的scripts文件夹，右键，命令行中打开
  b. 执行 `node hashfile.js` 命令，即可看到项目目录下面有个文件，包名.ios.zip的文件，就是热更新的zip文件
## 旧版本Android 微信配置
1. AppID：wx58e8910e60cd69ac
2. com.dmonline.v2
3. `Android平台
应用下载地址：未填写

应用签名：58c29cb32a1fbc7b1c95e5e7961e46df

包名：com.dmonline.v2` 

## app打包注意事项
1. 如果angular.json里面的outputPath不是默认值，需要先将angular.json里面的outputPath改为默认值，即www
2. 执行ionic cordova build android --prod --release 生成 android apk


## 判断是否是测试库
1. mockProBuild: true （测试库）
2. mockProBuild: !true （正式库）

## ios,android 插件开发详情查看官网
cordova 官网 `https://cordova.apache.org/`
插件教程：`https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/index.html`

## 取消自动刷新浏览器
`ng serve --liveReload=false`


## 环境变量配置
1. 安装 nodejs
2. 全局安装 @ionic/cli, @angular/cli , cordova ;`npm i -g @ionic/cli @angular/cli cordova`;
3. 安装 Android studio , 并且下载 sdk 
4. 配置Android SDK 的环境变量
   1 配置 SDK所在的目录
   2 配置 platforms目录
   2 配置 platform-tools 目录
5. 安装 `npm i -g cordova-res` ;用于生成Android图标，启动图标
6. 编译Android apk `ionic cordova build android --prod --release`
