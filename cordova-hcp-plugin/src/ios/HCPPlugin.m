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
NSString * const KEY_UDID_INSTEAD = @"com.beeant.ios.uuid";
@implementation HCPPlugin

#pragma mark Lifecycle
BOOL destroyed;
-(void)pluginInitialize {
    NSLog(@"pluginInitialize");
    [self loadHcpPageUrl];
}
- (void)handleOpenURL:(NSNotification *)notification{
    NSLog(@"handleOpenURL,notification: %@",notification);
}
- (void)onAppTerminate {
    NSLog(@"onAppTerminate");
    destroyed=YES;
}
-(void)loadHcpPageUrl {
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    NSString* path = [userDefault objectForKey: @"openHcpPage"];
    NSLog(@"loadHcpPageUrl userDefault path 页面 =%@",path);
    NSString* version = [self getVersionNumber];
    NSLog(@"loadHcpPageUrl version=%@",version);
    if(version!=nil){
        NSArray *aArray = [version componentsSeparatedByString:@"."];
        NSString* subVersion = [NSString stringWithFormat:@"%@_%@",aArray[0],aArray[1]];
        NSLog(@"subVersion = %@",subVersion);
        if([path containsString:subVersion]==NO){
            NSLog(@"loadHcpPageUrl 更新了应用,清除本地 NSUserDefaults 记录");
            NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
            [userDefault setObject:nil forKey:@"openHcpPage"];
            return;
        }
    }
    NSURL* url = [self.webViewEngine URL];
    NSLog(@"webViewEngine url absoluteString=%@",[url filePathURL]);
    NSLog(@"![path containsString _app_file_] %d",[path containsString:@"_app_file_"]);
    if(NO==[[url absoluteString] containsString:@"_app_file_"]||destroyed==YES){
        NSLog(@"loadHcpPageUrl 加载热更页面 path =%@",path);
    
        [self loadURL:path];
    }
}
-(NSString *) readFileAsText:(NSString*)filePath{
    NSString *path =filePath;
    if([filePath containsString:@"ionic://localhost/_app_file_"]){
        //path = [filePath stringByReplacingOccurrencesOfString:@"ionic://localhost/_app_file_" withString:@"file://"];
        path=[self pathForURL:filePath];
    }
    NSLog(@"读取的文件路径：%@",path);
    BOOL exists=[self testFileExists:path];
    if(!exists){
        NSLog(@"路径下的文件不存在");
        return @"";
    }
    NSURL *url = [NSURL fileURLWithPath:path];
    NSError* error;
    NSString *str = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error: &error];
    
    if (error == nil) {
        NSLog(@"读取到的内容: %@",str);
    }
    else{
        NSLog(@"%@",[error localizedDescription]);
    }
    return str;
//    [self.commandDelegate runInBackground:^{
//        NSString *path =filePath;// @"/Users/apple/Desktop/读写文件练习2/1.txt”;
//
//        NSURL *url = [NSURL fileURLWithPath:path];
//        NSError* error;
//        NSString *str = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error: &error];
//
//        if (error == nil) {
//            NSLog(@"读取到的内容: %@",str);
//        }
//        else{
//            NSLog(@"%@",[error localizedDescription]);
//        }
//    }];
}
- (NSString *)pathForURL:(NSString *)urlString
{
    // Attempt to use the File plugin to resolve the destination argument to a
    // file path.
    NSString *path = nil;
    id filePlugin = [self.commandDelegate getCommandInstance:@"File"];
    id ionicWebViewPlugin = [self.commandDelegate getCommandInstance:@"IonicWebView"];
    if (filePlugin != nil) {
        CDVFilesystemURL* url = [CDVFilesystemURL fileSystemURLWithString:urlString];
        path = [filePlugin filesystemPathForURL:url];
    }
    // If that didn't work for any reason, assume file: URL.
    if (path == nil) {
        if ([urlString hasPrefix:@"file:"]) {
            path = [[NSURL URLWithString:urlString] path];
        }
        if([urlString hasPrefix:@"ionic://"]){
            if(ionicWebViewPlugin!=nil){
                path=[urlString stringByReplacingOccurrencesOfString:@"ionic://localhost/_app_file_/" withString:@"file://"];
                NSLog(@"pathForURL path =%@ ",path);
            }
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
        [self.commandDelegate runInBackground:^{
            NSString *fileMD5 = [[NSData dataWithContentsOfFile:path] md5];
            [self sendSuccessStringResult:fileMD5 :command];
        }];
        
    }
}
- (void)onReset{
  
    NSLog(@"onReset");
}
- (NSString*)getVersionNumber
{
    NSString* version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
    if (version == nil) {
        NSLog(@"CFBundleShortVersionString was nil, attempting CFBundleVersion");
        version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
        if (version == nil) {
            NSLog(@"CFBundleVersion was also nil, giving up");
            // not calling error callback here to maintain backward compatibility
        }
    }
    return version;
}
- (void)onResume:(NSNotification *)notification {
    NSLog(@"onResume");
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
//        NSURL *loadURL = [NSURL URLWithString:[url containsString:@"ionic://localhost/_app_file_"
//                                               ]?[url stringByReplacingOccurrencesOfString:@"ionic://localhost/_app_file_" withString:@"file://"]
//                                                                 :url];
        NSLog(@"dddd:%@",[loadURL absoluteURL]);
        NSURLRequest *request = [NSURLRequest requestWithURL:loadURL
                                                 cachePolicy:NSURLRequestReloadIgnoringCacheData
                                             timeoutInterval:10000];
        NSLog(@"dddd:%@",[request URL]);
#ifdef __CORDOVA_4_0_0
        NSLog(@"__CORDOVA_4_0_0");
        [self.webViewEngine loadRequest:request];
#else
        [self.webView loadRequest:request];
#endif
    }];
}
-(void)getUUID:(CDVInvokedUrlCommand *)command{
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    NSString* uuid = [userDefault objectForKey:KEY_UDID_INSTEAD];
    if(uuid==nil||uuid.length==0){
        uuid=[self getDeviceIDInKeychain];
    }
    if(uuid==nil||uuid.length==0){
        [self sendErrorResult:@"获取UUID失败" :command];
        return;
    }
    [self sendSuccessStringResult:uuid :command];
    
}
// ios 获取设备uuid
-(NSString *)getDeviceIDInKeychain
{
    NSString *getUDIDInKeychain = (NSString *)[self load:KEY_UDID_INSTEAD];
    NSLog(@"从keychain中获取到的 UDID_INSTEAD %@",getUDIDInKeychain);
    if (!getUDIDInKeychain ||[getUDIDInKeychain isEqualToString:@""]||[getUDIDInKeychain isKindOfClass:[NSNull class]]) {
        NSString * result=[self appleIFA];
        if(result==nil){
            CFUUIDRef puuid = CFUUIDCreate( nil );
            CFStringRef uuidString = CFUUIDCreateString( nil, puuid );
            result = (NSString *)CFBridgingRelease(CFStringCreateCopy( NULL, uuidString));
            CFRelease(puuid);
            CFRelease(uuidString);
        }
        NSLog(@"\n \n \n _____重新存储 UUID _____\n \n \n  %@",result);
        [self save:KEY_UDID_INSTEAD data:result];
        getUDIDInKeychain = (NSString *)[self load:KEY_UDID_INSTEAD];
    }
    NSLog(@"最终 ———— UDID_INSTEAD %@",getUDIDInKeychain);
    NSUserDefaults *userDefault = [NSUserDefaults standardUserDefaults];
    [userDefault setObject:getUDIDInKeychain forKey:KEY_UDID_INSTEAD];
    return getUDIDInKeychain;
}

#pragma mark - private

- (NSMutableDictionary *)getKeychainQuery:(NSString *)service {
    return [NSMutableDictionary dictionaryWithObjectsAndKeys:
            (id)kSecClassGenericPassword,(id)kSecClass,
            service, (id)kSecAttrService,
            service, (id)kSecAttrAccount,
            (id)kSecAttrAccessibleAfterFirstUnlock,(id)kSecAttrAccessible,
            nil];
}

- (void)save:(NSString *)service data:(id)data {
    //Get search dictionary
    NSMutableDictionary *keychainQuery = [self getKeychainQuery:service];
    //Delete old item before add new item
    SecItemDelete((CFDictionaryRef)keychainQuery);
    //Add new object to search dictionary(Attention:the data format)
    [keychainQuery setObject:[NSKeyedArchiver archivedDataWithRootObject:data] forKey:(id)kSecValueData];
    //Add item to keychain with the search dictionary
    SecItemAdd((CFDictionaryRef)keychainQuery, NULL);
}

- (id)load:(NSString *)service {
    id ret = nil;
    NSMutableDictionary *keychainQuery = [self getKeychainQuery:service];
    //Configure the search setting
    //Since in our simple case we are expecting only a single attribute to be returned (the password) we can set the attribute kSecReturnData to kCFBooleanTrue
    [keychainQuery setObject:(id)kCFBooleanTrue forKey:(id)kSecReturnData];
    [keychainQuery setObject:(id)kSecMatchLimitOne forKey:(id)kSecMatchLimit];
    CFDataRef keyData = NULL;
    if (SecItemCopyMatching((CFDictionaryRef)keychainQuery, (CFTypeRef *)&keyData) == noErr) {
        @try {
            ret = [NSKeyedUnarchiver unarchiveObjectWithData:(__bridge NSData *)keyData];
        } @catch (NSException *e) {
            NSLog(@"Unarchive of %@ failed: %@", service, e);
        } @finally {
        }
    }
    if (keyData)
        CFRelease(keyData);
    return ret;
}

- (void)delete:(NSString *)service {
    NSMutableDictionary *keychainQuery = [self getKeychainQuery:service];
    SecItemDelete((CFDictionaryRef)keychainQuery);
}
-(NSString *)appleIFA {
    NSString *ifa = nil;
    Class ASIdentifierManagerClass = NSClassFromString(@"ASIdentifierManager");
    if (ASIdentifierManagerClass) { // a dynamic way of checking if AdSupport.framework is available
        SEL sharedManagerSelector = NSSelectorFromString(@"sharedManager");
        id sharedManager = ((id (*)(id, SEL))[ASIdentifierManagerClass methodForSelector:sharedManagerSelector])(ASIdentifierManagerClass, sharedManagerSelector);
        SEL advertisingIdentifierSelector = NSSelectorFromString(@"advertisingIdentifier");
        NSUUID *advertisingIdentifier = ((NSUUID* (*)(id, SEL))[sharedManager methodForSelector:advertisingIdentifierSelector])(sharedManager, advertisingIdentifierSelector);
        ifa = [advertisingIdentifier UUIDString];
    }
    return ifa;
}


@end



