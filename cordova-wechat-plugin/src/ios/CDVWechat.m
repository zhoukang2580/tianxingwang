

#include <sys/types.h>
#include <sys/sysctl.h>
#include "TargetConditionals.h"

#import <Cordova/CDV.h>
#import "CDVWechat.h"
#import "WXApi.h"
#import "WXApiObject.h"


@implementation CDVWechat
 CDVInvokedUrlCommand* cdvInvokedUrlCommand;
NSString* _appId;
-(void)getCode:(CDVInvokedUrlCommand *)command{
    cdvInvokedUrlCommand=command;
    NSString* appId = [command argumentAtIndex:0];
    if(nil==appId||[appId length]==0){
        [self FailureResult:command :@"appId 不能空"];
        return;
    }
    _appId=appId;
    [WXApi registerApp:appId];
    // Check command.arguments here.
    [self.commandDelegate runInBackground:^{
        
        SendAuthReq *req = [[SendAuthReq alloc] init];
        req.state = @"wx_oauth_authorization_state";//用于保持请求和回调的状态，授权请求或原样带回
        req.scope = @"snsapi_userinfo";//授权作用域：获取用户个人信息
        
        [WXApi sendReq:req];//发起微信授权请求
        // Some blocking logic...
        //        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:payload];
        //        The sendPluginResult method is thread-safe.
        //        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
    
}
- (void)handleOpenURL:(NSNotification *)notification
{
    NSURL* url = [notification object];
    
    if ([url isKindOfClass:[NSURL class]] && [url.scheme isEqualToString:_appId])
    {
        [WXApi handleOpenURL:url delegate:self];
    }
}
- (void)SuccessResult:(CDVInvokedUrlCommand*)command :(NSString*)result
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
                
                [self SuccessResult: cdvInvokedUrlCommand:res.code];
            }else{
                [self FailureResult:cdvInvokedUrlCommand :[NSString stringWithFormat:@"%d",res.errCode]];
            }
        }
    }
}
@end
