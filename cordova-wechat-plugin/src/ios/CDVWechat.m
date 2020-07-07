

#include <sys/types.h>
#include <sys/sysctl.h>
#include "TargetConditionals.h"

#import <Cordova/CDV.h>
#import "CDVWechat.h"
#import "WXApi.h"
#import "WXApiObject.h"
@implementation CDVWechat
 static CDVPlugin<WXApiDelegate> * wXApiDelegate;
 CDVInvokedUrlCommand* cdvInvokedUrlCommand;
 CDVInvokedUrlCommand* cdvPayInvokedUrlCommand;
NSString* _appId;
 NSString* const UNIVERSAL_LINK=@"https://*/";
- (void)pluginInitialize{
    NSLog(@"插件初始化 cdv wechat");
    wXApiDelegate=self;
}
+ (CDVPlugin<WXApiDelegate> *)getWxApiDelegate{
    return wXApiDelegate;
}
-(void)pay:(CDVInvokedUrlCommand *)command{
    @try {
        cdvPayInvokedUrlCommand=command;
        NSDictionary* info= [command argumentAtIndex:0];
        
        NSLog(@"info,%@",info);
        if(info==nil){
            [self FailureResult:command :@"参数错误"];
            return;
        }
        [self.commandDelegate runInBackground:^{
            _appId=[info objectForKey:@"appId"];
            NSString * universalLink=[info objectForKey:@"universalLink"];
            if(universalLink==nil){
                universalLink=[command argumentAtIndex:1];
            }
            if(universalLink==nil){
                universalLink=UNIVERSAL_LINK;
            }
//             NSLog(@"appid %@",_appId);
            [WXApi registerApp:_appId universalLink:universalLink];
            // 调起微信支付
            PayReq *request = [[PayReq alloc] init];
            /** 微信分配的公众账号ID -> APPID */
            request.partnerId = [info objectForKey:@"partnerId"];
//             NSLog(@"request.partnerId %@",request.partnerId);
            /** 预支付订单 从服务器获取 */
            request.prepayId = [info objectForKey:@"prepayId"];// @"1101000000140415649af9fc314aa427";
//             NSLog(@"request.prepayId %@",request.prepayId);
            /** 商家根据财付通文档填写的数据和签名 <暂填写固定值Sign=WXPay>*/
            request.package =[info objectForKey:@"packageValue"];
//             NSLog(@"request. package %@",request.package);
            /** 随机串，防重发 */
            request.nonceStr=[info objectForKey:@"nonceStr"];// @"a462b76e7436e98e0ed6e13c64b4fd1c";
//            NSLog(@"request. nonceStr %@",request.nonceStr);
            /** 时间戳，防重发 */
            NSString* timestamp = [info objectForKey:@"timeStamp"];
            request.timeStamp=(UInt32)[timestamp integerValue] ;//  @“1397527777";
//            NSLog(@"request. timeStamp %d ",request.timeStamp);
            /** 商家根据微信开放平台文档对数据做的签名, 可从服务器获取，也可本地生成*/
            request.sign=[info objectForKey:@"sign"];// @"582282D72DD2B03AD892830965F428CB16E7A256";
//                 NSLog(@"request. sign %@ ",request.sign);
            dispatch_async(dispatch_get_main_queue(), ^{
                /* 调起支付 */
                [WXApi sendReq:request completion:^(BOOL success){
                    if(success){
                        NSLog(@"OK ,支付发起成功");
                        self.currentCallbackId = command.callbackId;
                    }else{
                        [self FailureResult:command:@"发送请求失败"];
                    }
                }];
//                if ([WXApi sendre:request])
//                {
//                    NSLog(@"OK ");
////                     save the callback id
//                    self.currentCallbackId = command.callbackId;
//                }
//                else
//                {
//                    [self FailureResult:command:@"发送请求失败"];
//                }
            });
            
        }];
    } @catch (NSException *exception) {
        [self FailureResult:command :[NSString stringWithFormat:@"支付出错，%@",[exception reason]]];
    } @finally {
        
    }
}
-(BOOL)booWeixin{
 
    // 判断是否安装微信
 
    if ([WXApi isWXAppInstalled] ){
 
        //判断当前微信的版本是否支持OpenApi
 
        if ([WXApi isWXAppSupportApi]) {
 
            NSLog(@"安装了");
 
            return YES;
 
        }else{
 
            NSLog(@"请升级微信至最新版本！");
 
            return NO;
 
        }
 
    }else{
 
        NSLog(@"请安装微信客户端");
 
        return NO;
 
    }
 
}
-(void) share:(CDVInvokedUrlCommand *)command{
    [self.commandDelegate runInBackground:^{
        NSDictionary* args=[command argumentAtIndex:(0)];
            NSString* appId=[args valueForKey:@"appId"];
            NSString* universalLink=[args valueForKey:@"universalLink"];
            [WXApi startLogByLevel:WXLogLevelDetail logBlock:(WXLogBolock)^{
                
            }];
            _appId=appId;
            [WXApi registerApp:appId universalLink:universalLink];
            NSString* type=[args valueForKey:@"shareType"];
            if([@"WXTextObject" isEqualToString:type]){
                SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
                req.bText = YES;
                req.text = [args valueForKey:@"data"];
                req.scene = WXSceneSession;
                dispatch_async(dispatch_get_main_queue(), ^{
                 [WXApi sendReq:req completion:^(BOOL success){
                      
                  }];
                  [self sendSuccessResult:nil :command];
                });
                
                return;
            }
            if([@"WXWebpageObject" isEqualToString:type]){
                WXWebpageObject *webpageObject = [WXWebpageObject object];
                NSDictionary* args=[command argumentAtIndex:(0)];
                NSDictionary* data=[args valueForKey:@"data"];
                webpageObject.webpageUrl = [data valueForKey:@"webpageUrl"];
                WXMediaMessage *message = [WXMediaMessage message];
                message.title = [data valueForKey:@"webTitle"];
                message.description = [data valueForKey:@"webDescription"];
        //        [message setThumbImage:[UIImage imageNamed:@"缩略图.jpg"]];
                message.mediaObject = webpageObject;
                SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
                req.bText = NO;
                req.message = message;
                req.scene = WXSceneSession;
                NSString* openId=[data valueForKey:@"openId"];
        //        if(!(openId==nil||[openId length]==0)){
        //            req.openID=openId;
        //        }
                dispatch_async(dispatch_get_main_queue(), ^{
                   [WXApi sendReq:req completion:^(BOOL success){
                         NSLog(@"分享 %d",success);
                     }];
                   [self sendSuccessResult:nil :command];
                });
                
              return;
            }
    }];
    
}
- (void)isWXAppInstalled:(CDVInvokedUrlCommand *)command{
    if ([self booWeixin]){
        //安装了微信的处理
        [self sendSuccessResultWithString:command :@"ok"];
    } else {
        //没有安装微信的处理
        [self FailureResult:command :@"wechat uninstalled"];
    }
    
}
-(void)getCode:(CDVInvokedUrlCommand *)command{
    cdvInvokedUrlCommand=command;
    NSString* appId = [command argumentAtIndex:0];
    NSString* universalLink=[command argumentAtIndex:1];
    if(universalLink==nil){
        universalLink=UNIVERSAL_LINK;
    }
    if(nil==appId||[appId length]==0){
        [self FailureResult:command :@"appId 不能空"];
        return;
    }
    _appId=appId;
    [WXApi registerApp:appId universalLink:universalLink];
    // Check command.arguments here.
    [self.commandDelegate runInBackground:^{
        
        SendAuthReq *req = [[SendAuthReq alloc] init];
        req.state = @"wx_oauth_authorization_state";//用于保持请求和回调的状态，授权请求或原样带回
        req.scope = @"snsapi_userinfo";//授权作用域：获取用户个人信息
        //发起微信授权请求
        
        dispatch_async(dispatch_get_main_queue(), ^{
            [WXApi sendAuthReq:req viewController:self.viewController delegate:self completion:^(BOOL success){
                NSLog(@"发起授权成功");
            }];
        });
        
        // Some blocking logic...
        //        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:payload];
        //        The sendPluginResult method is thread-safe.
        //        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
    
}

- (void)handleOpenURL:(NSNotification *)notification
{
    NSURL* url = [notification object];
    
//    if ([url isKindOfClass:[NSURL class]])
//     {
//         NSLog(@"notification,url scheme=%@,url query=%@,appid=%@",url.scheme,url.query,_appId);
//     }
    if ([url isKindOfClass:[NSURL class]] && [url.scheme isEqualToString:_appId])
    {
        [WXApi handleOpenURL:url delegate:self];
    }
    if ([url.host isEqualToString:@"pay"]) {
         [WXApi handleOpenURL:url delegate:self];
    }
}
-(void) sendSuccessResult:(NSDictionary *)data : (CDVInvokedUrlCommand*)command{
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:data];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
- (void)sendSuccessResultWithString:(CDVInvokedUrlCommand*)command :(NSString*)result
{
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
- (void)FailureResult:(CDVInvokedUrlCommand*)command :(NSString*)errmsg
{
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errmsg];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
-(void)onReq:(BaseReq *)req{
    
}
-(void)onResp:(BaseResp *)resp{
    if([resp isKindOfClass:[SendAuthResp class]]){//判断是否为授权登录类
        SendAuthResp *res = (SendAuthResp *)resp;
        if(cdvInvokedUrlCommand!=nil){
            if([res.state isEqualToString:@"wx_oauth_authorization_state"]){//微信授权成功
//                NSLog(@"res.state=%@,code=%@",res.state,res.code);
                [self sendSuccessResultWithString: cdvInvokedUrlCommand:res.code];
            }else{
                [self FailureResult:cdvInvokedUrlCommand :[NSString stringWithFormat:@"%d",res.errCode]];
            }
        }
    }
    if([resp isKindOfClass:[PayResp class]]){
         NSLog(@"支付结果返回,%d",resp.errCode);
        switch (resp.errCode) {
            case WXSuccess:{
                NSLog(@"支付成功,%@",resp);
                // 发通知带出支付成功结果
                if(nil!=cdvPayInvokedUrlCommand){
                    [self sendSuccessResultWithString:cdvPayInvokedUrlCommand :[NSString stringWithFormat:@"支付成功，code=%d",resp.errCode]];
                }
                break;
            }
            default:{
                NSLog(@"支付失败:%d",resp.errCode);
                // 发通知带出支付失败结果
                [self FailureResult:cdvPayInvokedUrlCommand :[NSString stringWithFormat:@"支付失败,%@,%d",resp.errStr,resp.errCode]];
              break;
            }
                
        }
    }
}


@end
