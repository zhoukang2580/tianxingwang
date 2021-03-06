/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#include <sys/types.h>
#include <sys/sysctl.h>
#include "TargetConditionals.h"

#import <Cordova/CDV.h>
#import "CDVAli.h"

#import <AlipaySDK/AlipaySDK.h>
CDVInvokedUrlCommand *cdvCommand;
@interface CDVAli () {}
@end

@implementation CDVAli
- (void)pay:(CDVInvokedUrlCommand *)command{
    cdvCommand=command;
    [self.commandDelegate runInBackground:^{
        @try {
            NSString *orderString =[command argumentAtIndex:0];
            NSLog(@"支付字符串 =%@",orderString);
            if(nil==orderString||[orderString length]==0){
                [self sendErrorResult:@"支付字符串不能为空" :command];
                return;
            }
            dispatch_async(dispatch_get_main_queue(), ^{
                // NOTE: 调用支付结果开始支付
                [[AlipaySDK defaultService] payOrder:orderString fromScheme:@"skytripAlipay" callback:^(NSDictionary *resultDic) {
                    NSLog(@"支付接口调用后返回的结果reslut = %@",resultDic);
                    [self sendSuccessResult:resultDic :command];
                }];
            });
            
        } @catch (NSException *exception) {
            [self sendErrorResult:[NSString stringWithFormat:@"支付异常，%@",[exception reason]] :command];
        } @finally {
            
        }
    }];
}
-(void) isAliPayInstalled:(CDVInvokedUrlCommand *)command{
    NSURL * myURL_APP_A = [NSURL URLWithString:@"alipay:"];
    NSString *alipay =[command argumentAtIndex:0];
    if(alipay!=nil&&[alipay length]>0){
        myURL_APP_A=[NSURL URLWithString:alipay];
    }
    if (![[UIApplication sharedApplication] canOpenURL:myURL_APP_A]) {        //如果没有安装支付宝客户端那么需要安装
          [self sendErrorResult:@"Not Installed" :command];
        return;
    }
    [self sendSuccessStringResult:@"Ok" :command];
}
-(void) payWebUrl:(CDVInvokedUrlCommand *)command{
    NSString *alipay =[command argumentAtIndex:0];
    NSURL* url=[NSURL URLWithString:alipay];
    UIApplication *application = [UIApplication sharedApplication];
    if ([application respondsToSelector:@selector(openURL:options:completionHandler:)]) {
      [application openURL:url options:@{}
         completionHandler:^(BOOL success) {
//        NSLog(@"Open %@: %d",scheme,success);
          if(success){
              [self sendSuccessStringResult:@"唤起成功" :command];
          }else{
              [self sendErrorResult:@"唤起失败" :command];
          }
      }];
    } else {
      BOOL success = [application openURL:url];
        if(success){
            [self sendSuccessStringResult:@"唤起成功" :command];
        }else{
            [self sendErrorResult:@"唤起失败" :command];
        }
        
//      NSLog(@"Open %@: %d",scheme,success);
    }
    
}
- (void)handleOpenURL:(NSNotification *)notification{
    NSURL* url = [notification object];
    if ([url.host isEqualToString:@"safepay"]) {
        //跳转支付宝钱包进行支付，处理支付结果
        [[AlipaySDK defaultService]
         processOrderWithPaymentResult:url
         standbyCallback:^(NSDictionary *resultDic) {
//             NSLog(@"唤起支付宝支付后，返回的结果 result = %@",resultDic);//返回的支付结果
             if(nil!=cdvCommand){
                 [self sendSuccessResult:resultDic :cdvCommand];
             }
             
         }];
    }
   
}
-(void) sendErrorResult:(NSString*)reason : (CDVInvokedUrlCommand*)command{
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:reason];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
-(void) sendSuccessStringResult:(NSString *)result : (CDVInvokedUrlCommand*)command{
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:result];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
-(void) sendSuccessResult:(NSDictionary *)data : (CDVInvokedUrlCommand*)command{
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:data];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end



