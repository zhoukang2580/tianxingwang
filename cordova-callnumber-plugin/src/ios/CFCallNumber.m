#import <Cordova/CDVPlugin.h>
#import "CFCallNumber.h"

@implementation CFCallNumber

- (void) callNumber:(CDVInvokedUrlCommand*)command {
    
    [self.commandDelegate runInBackground:^{

        
        dispatch_async(dispatch_get_main_queue(), ^{
            static CDVPluginResult* pluginResult = nil;
            NSString* number = [command.arguments objectAtIndex:0];
            number =  [number stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
            if( ! [number hasPrefix:@"tel:"]){
                number =  [NSString stringWithFormat:@"tel:%@", number];
            }

            if(![[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:number]]) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"NoFeatureCallSupported"];
            }
            else{
                [[UIApplication sharedApplication]openURL:[NSURL URLWithString:number] options:@{UIApplicationOpenURLOptionsSourceApplicationKey : @YES} completionHandler:^(BOOL success) {
                    if (!success) {
                        // missing phone number
                        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"CouldNotCallPhoneNumber"];
                    }else{
                        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                    }
                }];
            }
//  else if(![[UIApplication sharedApplication] openURL:[NSURL URLWithString:number]]) {
//          // missing phone number
//                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"CouldNotCallPhoneNumber"];
//            }
//            else {
//                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
//            }

            // return result
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            
               });
        
        

    }];
}

@end
