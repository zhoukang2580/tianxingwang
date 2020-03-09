#import <UIKit/UIKit.h>
#import <Cordova/CDVPlugin.h>
#import "WXApi.h"
#import "WXApiObject.h"
@interface CDVWechat : CDVPlugin<WXApiDelegate>
@property (nonatomic, strong) NSString *currentCallbackId;
- (void)getCode:(NSString*)appId;
- (void) isWXAppInstalled:(NSString*) appId;
@end
