//
//  HCPPlugin.m
//
//  Created by Nikolay Demyankov on 07.08.15.
//

#import <Cordova/CDVConfigParser.h>
#import "NSData+HCPMD5.h"
#import "HCPPlugin.h"
#import "CDVFile.h"
@interface HCPPlugin() {
}

@end

#pragma mark Local constants declaration

static NSString *const DEFAULT_STARTING_PAGE = @"index.html";

@implementation HCPPlugin

#pragma mark Lifecycle

-(void)pluginInitialize {
    
}

- (void)onAppTerminate {
    
}
- (NSString *)pathForURL:(NSString *)urlString
{
    // Attempt to use the File plugin to resolve the destination argument to a
    // file path.
    NSString *path = nil;
    id filePlugin = [self.commandDelegate getCommandInstance:@"File"];
    if (filePlugin != nil) {
        CDVFilesystemURL* url = [CDVFilesystemURL fileSystemURLWithString:urlString];
        path = [filePlugin filesystemPathForURL:url];
    }
    // If that didn't work for any reason, assume file: URL.
    if (path == nil) {
        if ([urlString hasPrefix:@"file:"]) {
            path = [[NSURL URLWithString:urlString] path];
        }
    }
    return path;
}
- (void)getHash:(CDVInvokedUrlCommand *)command{
     NSString* filePath= [command argumentAtIndex:0];
   NSString *path= [self pathForURL:filePath];
     [self testFileExists:path :command];
    @autoreleasepool {
        NSString *fileMD5 = [[NSData dataWithContentsOfFile:path] md5];
        [self sendSuccessStringResult:fileMD5 :command];
    }
}
- (void)onResume:(NSNotification *)notification {
}
- (void)testFileExists :(NSString*)argPath : (CDVInvokedUrlCommand*)command
{
    // Get the file manager
    NSFileManager* fMgr = [NSFileManager defaultManager];
    NSString* appFile = argPath; // [ self getFullPath: argPath];
    NSLog(@"输入的文件路径%@",argPath);
    BOOL bExists = [fMgr fileExistsAtPath:appFile];
//    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:(bExists ? 1 : 0)];
//
    if(!bExists){
        [self sendErrorResult:@"文件不存在" :command];
        return;
    }
    
}
- (void)openHcpPage:(CDVInvokedUrlCommand *)command{
    NSString* filePath= [command argumentAtIndex:0];
      NSString *path= [self pathForURL:filePath];
    [self testFileExists:path :command];
     NSFileManager* fMgr = [NSFileManager defaultManager];
    NSString* p = [@"file://" stringByAppendingString:path];
    NSLog(@"打开的路径：%@",p);
    [self loadURL:p];
    
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
/**
 *  Load given url into the WebView
 *
 *  @param url url to load
 */
- (void)loadURL:(NSString *)url {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
        NSURL *loadURL = [NSURL URLWithString:[NSString stringWithFormat:@"%@", url]];
        NSURLRequest *request = [NSURLRequest requestWithURL:loadURL
                                                 cachePolicy:NSURLRequestReloadIgnoringCacheData
                                             timeoutInterval:10000];
#ifdef __CORDOVA_4_0_0
        [self.webViewEngine loadRequest:request];
#else
        [self.webView loadRequest:request];
#endif
    }];
}



@end

