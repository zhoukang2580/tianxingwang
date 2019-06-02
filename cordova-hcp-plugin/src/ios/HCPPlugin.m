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
    [self onResume:nil];
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
    BOOL exists= [self testFileExists:path];
    if(!exists){
        [self sendErrorResult:@"路径不存在" :command];
        return ;
    }
    @autoreleasepool {
        NSString *fileMD5 = [[NSData dataWithContentsOfFile:path] md5];
        [self sendSuccessStringResult:fileMD5 :command];
    }
}
- (void)onReset{
    NSLog(@"onReset");
}
- (void)onResume:(NSNotification *)notification {
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    NSString* path = [userDefault objectForKey: @"openHcpPage"];
    NSLog(@"userDefault path =%@",path);
    BOOL exists= [self testFileExists:path];
    if(!exists){
        return ;
    }
    NSLog(@"loadURL,path = %@",path);
    [self loadURL:path];
}
-(void)checkPathOrFileExists:(CDVInvokedUrlCommand*) command{
    NSString* filePath = [command argumentAtIndex:0];
    BOOL exists = [self testFileExists:filePath];
    if(exists){
        [self sendSuccessResult:nil : command];
    }else{
        [self sendErrorResult:[NSString stringWithFormat:@"路径不存在 path=%@",filePath] :command];
    }
}
- (BOOL)testFileExists :(NSString*)argPath
{
    // Get the file manager
    NSFileManager* fMgr = [NSFileManager defaultManager];
    NSString* appFile = argPath; // [ self getFullPath: argPath];
    NSLog(@"输入的文件路径%@",argPath);
    BOOL bExists=NO;
    bExists =(appFile!=nil||[appFile length]!=0) && [fMgr fileExistsAtPath:appFile];
    //    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:(bExists ? 1 : 0)];
    //
    NSLog(@"输入的文件路径是否存在 %@",bExists?@"YES":@"NO");
    return bExists;
    
}

- (void)openHcpPage:(CDVInvokedUrlCommand *)command{
    NSString* filePath= [command argumentAtIndex:0];
    NSLog(@"打开的路径：%@",filePath);
    if(filePath==nil ||[filePath length]==0){
        [self sendErrorResult:@"路径不存在" :command];
        return ;
    }
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    [userDefault setObject:filePath forKey:@"openHcpPage"];
    [self sendSuccessStringResult:@"ok" :command];
    [self loadURL:filePath];
}
- (void)saveHcpPath:(CDVInvokedUrlCommand *)command{
    NSString* filePath= [command argumentAtIndex:0];
    NSLog(@"保存的路径=%@",filePath);
    if(filePath==nil ||[filePath length]==0){
        [self sendErrorResult:@"路径不存在" :command];
        return ;
    }
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    [userDefault setObject:filePath forKey:@"openHcpPage"];
    [self sendSuccessStringResult:@"ok" :command];
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


