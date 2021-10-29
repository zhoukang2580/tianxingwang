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
## 安装依赖
`npm i `,如果国内运行慢，可以尝试使用淘宝镜像 ，
npm config set registry https://registry.npm.taobao.org
`npm install -g cnpm --registry=https://registry.npm.taobao.org`
然后后续的安装模块命令和 npm 一样，仅需要将 npm 改成 cnpm 
参考网址:`https://npm.taobao.org/`
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
  `ng serve --disableHostCheck=true --hmr=true --optimization=false --sourceMap=false --vendorChunk=true`
ngnix 启动 ：ng serve --disableHostCheck
## 运行项目
`ng serve `,如果要指定端口运行，`ng serve --port 端口号`
如果不需要自动刷新 `ng serve --liveReload=false`
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

# 发布注意
 0. 包名到config.xml里面的id="xxx"那个值，拷贝即可，或者查看项目目录下面的.zip文件的名字
 1. ng build --prod  --base-href /www/  
 2. 如果是打包apk，首先需要将angular.json目录下面的output path恢复到默认值，www，然后执行 cordova打包命令，打包完成后，项目目录下面会生成一个 `包名.json`文件，这个文件放置到服务器版本检查的目录即可，如果文件已经存在服务器版本检查的目录中，只需要修改服务器目录下面的 `包名.json`文件内的版本号即可。
## 发布apk：
0. 修改config.xml里面的包名，修改主版本号或者次版本号（增加）
1. 打包完成后，会在命令行中输入出apk的相关信息，名字较长，包含md5的apk就是要放到服务器下载目录（wwwroot）目录下面，然后将名字中的md5值剪切，再到`包名.json`所在的文件中，将apkmd5的值替换成刚刚剪切的值，然后修改版本号为此次发布apk的版本号即可。
2. ios更新的APP的id是1513565385
## 发布热更文件：
1. 可选修改config.xml文件里面的包名，增加热更版本号，然后执行cordova 打包命令，
2. 打包完成后，可以再项目目录下找到一个`包名.平台.md5.zip`的文件，其中的md5就是此次打包的zip文件的md5，将这个zip文件拷贝到服务器热更文件存储目录下(wwwroot)，然后将名字中的md5剪切，注意，留下的文件名应该是`包名.平台.zip`，然后将md5替换版本配置文件当中的md5的值，同时，修改版本号问当前热更版本号即可。
# 测试账号
  1. 测试地址用test001 123456
  2. 生产的话用test 112233
# 测试环境APK打包
  1. 将environment.prod.ts里面的mockProdBuild设置为true，然后执行命令，`ionic cordova build android --prod` 注意，不要添加 --release 选项。 
  2. 打包完成后，生成的apk访问的就是测试服务器的地址
  注意事项：测试环境的apk无法调试微信相关的功能

  ## 更新app过程
1. 到config.xml修改版本号，修改主、次版本号需要重新发布到appstore或者安卓市场，如果修改的是热更版本号，也就是最后一位，则不需要重新发布应用
2. 执行生产环境打包，生产android的apk，用mac打包，生成iphone的app，分别发布到市场
3. 如果不需要发布应用，仅发布热更，先用生成apk的命令正常打包，然后在项目目录下找到xxx.xxx.android.hash.zip的文件，ios则是 包名.ios.hash.zip，将文件复制到service.version站点的download目录下面（删除就的zip文件，或者重命名），并且将文件名的hash剪切，将这个hash复制到Applications下面对应的 xxx.android.json或者xxx.ios.json文件的MD5对应的地方，注意，不是apkmd5,apkmd5是更新apk时候，用于校验apk的hash值用的。最后将版本号修改即可。注意看config.xml里面的版本号前两位，需要保持一致，最后一位是热更新用的，增加最后一位即可。
4. 最后修改updateList.xml修改对应的配置项。其中的Value=config.xml的版本号，其中的version节点对应Android的apk更新，其内部的hotfix对应热更的www目录。md5的值在编译生成的output目录的xxx.apk路径中很长的一段字符串就是对应的md5
5. 非常重要的注意点，如果是ios热更，一定要用mac进行build ios 生成的 xxx.ios.zip文件，否则更新失败！！！
6. 由于历史原因，生产的iOS热更新文件的json名字是 `com.eskytrip.zhaozuomingios.ios.json`,下载的文件名字根据json文件内部指定名字即可。
7. mac上打包时候，到target里面的info找到plist文件，添加微信的白名单 `weixinULAPI`
8. 在平果开发者中心，找到Identifiers，应用管理中，勾上Associated Domains
9. 在info 下面url types出添加一个identityfier wechat 或者 weixin ，url schema 的值为对应的appid(查看config.ts)
## 发布
`ng build --prod --base-href /www/`
ng serve --disableHostCheck
如果出现内存溢出，则需要修改
`npm run build-prod`
## 修改wechat app id 
1. 到项目目录下面找到config.ts，修改里面的wechatappid
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
在info标签下，找到最下面的URL Types 添加 微信的 url type weixinULAPI 否则跳转微信后无法返回APP
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
2. 执行`ionic cordova build android --prod --release` 生成 android apk
3. 如果编译出错，试试删除android 平台，然后重新添加
    `ionic cordova platform rm android ` , `ionic cordova platform add android`
4. 如果需要重新生成启动页面和图标，执行 `ionic cordova resources -f `

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

如何生成不同公司的App
1. 修改config.xml里面的包名和版本号
2. 修改resources文件夹里面的icon和splash
3. 生成启动图标和应用图标 ionic cordova resources -f 
4. 修改config.ts里面的配置
5. 删除旧的platform `ionic cordova platform remove android ` 添加新的platform `ionic cordova platform add android `
6. 生成apk，ionic cordova build android --prod --release

## 打包编译报内存不足
1. `npm install -g increase-memory-limit`
2. `increase-memory-limit`

## 解决ios粘贴复制显示为英文的问题
info-plist 添加 Localizations，参考config.xml 下面的 Localizations节点


## ios 发布生产过程
1. 先切换到要发布版本的分支，一般是master分支，然后获取最新代码
2. 到config.xml里面修改报名为 com.eskytrip.zhaozuomingios
3. 确认版本号
4. 修改config.ts里面的配置选项，将mockProBuild设置为false，将isShowVConsole设置为false，根据项目APP的名称，确定是否修改 appTitle字段，确认AppleStoreAppId的值是否需要修改
5. 执行 ionic cordova build ios --prod --release 执行生产编译
6. 编译完成后，请撤销对config.xml包名的修改
7. 编译完成后，用xcode打开platform/ios的项目
8. 打开项目后，检查info选项卡下面的URL Types 里面的item，是否有遗漏微信的跳转配置，如果没有weixin或者wechat配置项，需要添加一个，identifier为wechat或者weixin值是config.ts里面的wechat对象里面的appId的值，如果没有配置这一项，跳转微信后，将不能跳转回来
9. 用xcode编译一下项目，看看是否有问题，最好先连接自己的平果手机，选择自己的手机然后安装到手机调试看看有无问题。
10. 切换到Signing&Capabilities选项卡，将Automatically manage signing的对勾去掉，然后在provisioning profile选择最新的发布provisioning描述文件，再编译一次
11. 在菜单栏找到Product菜单，在列表中选择Archive,等待归档完成
12. 在弹出的窗口，右边有个Distribute App 和Validate APP，先执行一下Validate APP
13. 在弹出的窗口中，选择next ,当 出现需要选择 证书 certificate and ios apple store profile的窗口时，选择对应的生产证书然后next,等待校验完成
14. 校验没有问题后，重新选择 Distribute App
15. 选择Apple store Connect,选择upload 
16. 证书选择和前面相同
17. 上传完毕后，浏览器打开 https://appstoreconnect.apple.com/,登陆后，点击对应的APP，当前是天行商旅，在新的界面，有个加号，点击加号（如果有新的协议更新，需要先完成新协议同意的操作），添加一个版本号，填写更新说明，然后再在对应的地方填写相关信息，
18. 在 “构建版本” 中选择刚刚上传的版本（可能需要等十多分钟才看见，或者等几个小时），然后就可以提交审核了。
### 如果是发布ios热更版本
删除项目目录下面所有的 包名.哈希值.zip或者 包名.ios.zip
步骤同 1，2，3，4，5
编译完后，如果项目目录下面没有出现一个文件：
com.eskytrip.zhaozuomingios.哈希值.ios.zip
的文件，则需要手动生成:
1. cd scripts 进入到scripts目录
2. node hashfile.js 
执行完后，可以看到一个包名.哈希值.ios.zip文件
3. 将上面的那个zip文件拷贝到生产服务器service.version站点下面的wwwroot目录里面的download文件夹下面，然后将文件的哈希值剪切出来，将服务器该目录下面的包名.ios.zip文件删除，然后把刚刚复制的文件重命名为包名.ios.zip。在同站点下面有个Applications文件夹，进入到文件夹，可以看到包名.ios.json文件进入到该文件，将刚刚剪切出来的哈希值，替换掉Md5字段的值，然后将
Version版本号的最后一位数字修改为当前数值加1，保存文件即可。
如果有多台服务器，只需要重复步骤3的操作即可。


## Android 发布生产过程
1. 先切换到要发布版本的分支，一般是master分支，然后获取最新代码
2. 到config.xml里面修改报名为 com.skytrip.dmonlie ,一般情况下，默认的就可以，因为发布ios后，请撤销对包名的修改
3. 确认版本号
4. 修改config.ts里面的配置选项，将mockProBuild设置为false，将isShowVConsole设置为false，根据项目APP的名称，确定是否修改 appTitle字段，确认AppleStoreAppId的值是否需要修改
5. 执行 ionic cordova build android --prod --release 执行生产编译
6. 直接将新生成的包名.哈希值.apk复制到服务器service.version站点下面的wwwroot目录里面的download里面,将原来的dmonline.apk重命名或者删除，然后将新复制过来的apk重命名为dmonline.apk，最好在重命名的时候，把哈希值剪切出来
7. 返回上两级目录，也就是Applications目录，里面有个包名.android.json文件，进入后，将刚刚剪切的apk哈希值替换ApkMd5字段，Version的值要和此次编译的config.xml里面的版本号保持一致
### 如果是发布Android热更版本
删除项目目录下面所有的 包名.哈希值.zip或者 包名.android.zip
步骤同 1，2，3，4，5
编译完后，项目目录下面出现一个文件：包名.哈希值.ios.zip
 将上面的那个zip文件拷贝到生产服务器service.version站点下面的wwwroot目录里面的download文件夹下面，然后将文件的哈希值剪切出来，将服务器该目录下面的包名.android.zip文件删除，然后把刚刚复制的文件重命名为包名.android.zip。在同站点下面有个Applications文件夹，进入到文件夹，可以看到包名.android.json文件进入到该文件，将刚刚剪切出来的哈希值，替换掉Md5字段的值，然后将
Version版本号的最后一位数字修改为当前数值加1，保存文件即可。
如果有多台服务器，只需要重复步骤3的操作即可。

##热更新服务器json文件说明
{
  “DownloadUrl”:"",//热更新zip文件在服务器的位置
  "Md5":"",//热更新zip包的md5的值
  "ApkDownloadUrl":"",// apk在服务器的位置
  "Version":"",//当前的人更新的版本号，最后一位是热更新版本，其他两位是更新APP，如果是Android就是相当于重新安装apk，ios则需要跳转到applestore更新
  "Ignore":false/true,//是否强制更新，如果是false，则提示用户，否则不提示，直接下载更新，用户需要等待更新完成后才能操作
  "EnabledHcpUpdate":true/false,// 是否允许热更新，false不允许，即不检查更新
  "EnabledHAppUpdate":true/false,// 是否允许更新App，false不允许，即不检查更新
}
## 关于热更的注意事项
一般情况下，Android直接修版本号的第二位数值，然后编译，发布一个APP升级包即可，热更不太稳定，特别是ios的热更，可能有的机型打开的不是最新的版本，所以ios的热更是出现紧急问题修复才发布，发布后，当天就提交一个ios更新到Applestore审核，审核通过后，将服务器版本号修改为和审核版本的版本号一致，让用户到apple store手动更新APP。

## 发布h5
1. 先切换到要发布版本的分支，一般是master分支，然后获取最新代码
2. 到config.xml里面修改报名为 com.skytrip.dmonlie ,一般情况下，默认的就可以，因为发布ios后，请撤销对包名的修改
3. 确认版本号
4. 修改config.ts里面的配置选项，将mockProBuild设置为false，将isShowVConsole设置为false，根据项目APP的名称，确定是否修改 appTitle字段，确认AppleStoreAppId的值是否需要修改
5. 执行 ng build --prod --base-href /www/ 执行生产编译
6. 将www目录拷贝到服务器client.app站点下面的wwwroot，首先将原来的www重命名，然后将新的www复制过去即可。
# ios 上长按弹出选择变成了英文的解决办法
在 p-infolist新增一个 Localizations，添加两个语言选项，一个是English，一个是Chinese（simplified)
## 安装cordova-push-plugin 注意事项
如果提示pod相关错误，需要切换到platform/ios所在的目录，执行以下命令
先更新repo 
pod repo list 查看一下repo列表
删除警告提示的分支，可能是master，保留另一个 trunk
sudo gem install cocoapods --pre 更新pod
pod repo update 更新pod本地仓库
最后执行
pod install 
如果提示网络连接的错误，请多重复几次，如果还不行，用手机开流量热点，执行，确保安装完成。
如果以上还不能正常安装，则先删除platform ios，重新添加，重新添加插件
重复执行以上步骤
安装完后，非常重要的一点就是检查一下 项目目录下面的pods-debug.xcconfig和pods-release.xcconfig里面的内容是否和
pods/target support files/pods-项目名称.debug.xcconfig,pods-项目名称.release.xcconig里面的内容一致，如果不一致，从pods/target support files/里面的两个文件的内容拷贝到对于的文件中
注意，打开xcode项目的时候，要选 项目名称.xcworkspace打开，而不是以往的 xxx.xcodeproj，否则编译不通过
如果编译遇到 framework not found Pods_XXX___ 
解决方法：
1.项目蓝色图标－>Targets->General->Linked Frameworks and Libraries
2.删除 Pods_XXX___.frameworks
可以成功编译
如果ios发布，确定不需要background modes的voice ip的功能，则在编译的时候，在tagets 里面的signing&capabilities里面的modes处把voice over id 的√去掉。不要选中，然后编译发布，否则发布要提供视频demo证明需要这个功能！没有提供就审核被拒！
