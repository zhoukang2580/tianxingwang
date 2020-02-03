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
所有的模块功能界面下面的子页面，名字用杠分割，和功能模块子页面平级，前缀是当前功能子页面的页面名称
比如，account 模块，

--- account
   |----account-password 该页面是account模块下面的修改密码功能页面
   |----account-password-by-sms-code 该页面是account-password的子页面
   
简单理解，就是要前缀一致

## 更新app和热更新的逻辑
`Main.Minor.Patch` --主版本.次版本.热更新版本
记录在config.xml文件内
1. 主版本和次版本不变，就不用更新app
2. (1)的情况下，查看人更新的版本号，检查本地目录是否已经存在，不存在该热更新版本，则下载更新，新增一个目录名称，存放新文件，下次启动后加载新目录的文件

## 更新app过程
1. 到config.xml修改版本号，修改主、次版本号需要重新发布到appstore或者安卓市场，如果修改的是热更版本号，也就是最后一位，则不需要重新发布应用
2. 执行生产环境打包，生产android的apk，用mac打包，生成iphone的app，分别发布到市场
3. 如果不需要发布应用，仅发布热更，则将生成的xxx.xxx.xxx(包名).android.zip放到热更的Android目录下，同理，将生成的xxx.xxx.xxx.ios.zip放到ios的下载目录
4. 最后修改updateList.xml修改对应的配置项。其中的Value=config.xml的版本号，其中的version节点对应Android的apk更新，其内部的hotfix对应热更的www目录。md5的值在编译生成的output目录的xxx.apk路径中很长的一段字符串就是对应的md5
5. 非常重要的注意点，如果是ios热更，一定要用mac进行build ios 生成的 xxx.ios.zip文件，否则更新失败！！！
## 发布
`ng build --prod --base-href /www/`
ng serve --disableHostCheck

## 修改wechat app id 
1. 到项目目录下面找到config.xml，找到里面的 `<preference name="WECHATAPPID" value="wx58e8910e60cd69ac" />`
2. 将其值修改对应的appid即可
## ios 发布app说明
执行命令前，先到config.xml修改版本号
1. 首先执行 `sudo ionic cordova build ios --prod`
2. 用 xcode 打开 platforms/ios/项目
3. 到xcode target 的选项卡中打开 info，修改打包的bundle identifier为： `com.eskytrip.zhaozuomingios`，如果要修改微信appid ,修改最底下的url types 的schema `https://pay.weixin.qq.com/wiki/doc/api/app/app.php?chapter=8_5`,位置访问，需要在info标签下面新增 key =`Privacy - Location Always Usage Description`和`Privacy - Location Usage Description`
4. 执行archive打包，传到iTunes,提交审核

## 旧版本Android 微信配置
1. AppID：wx58e8910e60cd69ac
2. com.dmonline.v2
3. `Android平台
应用下载地址：未填写

应用签名：58c29cb32a1fbc7b1c95e5e7961e46df

包名：com.dmonline.v2` 