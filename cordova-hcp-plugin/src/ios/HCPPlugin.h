//
//  HCPPlugin.h
//
//  Created by Nikolay Demyankov on 07.08.15.
//

#import <Cordova/CDVPlugin.h>
#import <Cordova/CDV.h>

/**
 *  Plugin main class
 */
@interface HCPPlugin : CDVPlugin

#pragma mark Methods, invoked from JavaScript


- (void)getHash:(CDVInvokedUrlCommand *)command;


- (void)openHcpPage:(CDVInvokedUrlCommand *)command;
- (void)saveHcpPath:(CDVInvokedUrlCommand *)command;

- (void)getUUID:(CDVInvokedUrlCommand *)command;

@end
