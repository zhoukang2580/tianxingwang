package com.beeant.push;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;

import com.heytap.msp.push.HeytapPushManager;
import com.heytap.msp.push.callback.ICallBackResultService;
import com.huawei.hms.aaid.HmsInstanceId;
import com.huawei.hms.common.ApiException;
import com.huawei.hms.push.HmsMessaging;
import com.vivo.push.IPushActionListener;
import com.vivo.push.PushClient;
import com.vivo.push.ups.TokenResult;
import com.vivo.push.ups.UPSRegisterCallback;
import com.vivo.push.ups.VUpsManager;
import com.vivo.push.util.VivoPushException;
import com.xiaomi.channel.commonutils.logger.LoggerInterface;
import com.xiaomi.mipush.sdk.Logger;
import com.xiaomi.mipush.sdk.MiPushClient;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class PushPlugin extends CordovaPlugin {
    public static final String TAG = "PushPlugin";
    public static CallbackContext sMTokenCallback;
    public static CallbackContext sMMessageCallbackContext;
    public static CallbackContext sMMiPushRegisterCallbackContext;
    public static CallbackContext sMViVoPushRegisterCallbackContext;
    public static boolean sMshouldInit = false;
    public static boolean sMIsAppStarted = false;
    public static boolean smIsViVoInit = false;
    public static CordovaWebView sMWebView = null;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        sMWebView = webView;
        super.initialize(cordova, webView);
        sMIsAppStarted = cordova.getActivity() != null;
        //打开Log
        LoggerInterface newLogger = new LoggerInterface() {

            @Override
            public void setTag(String tag) {
                // ignore
            }

            @Override
            public void log(String content, Throwable t) {
                Log.d(TAG, content, t);
            }

            @Override
            public void log(String content) {
                Log.d(TAG, content);
            }
        };
        Logger.setLogger(cordova.getContext(), newLogger);
    }

    private void registerPushMiPushClient(String appId, String appKey,
                                          CallbackContext callbackContext) {
        sMMiPushRegisterCallbackContext = callbackContext;
        try {
            //初始化push推送服务
            if (!sMshouldInit) {
                sMshouldInit = true;
                MiPushClient.registerPush(cordova.getContext(), appId, appKey);
            }
        } catch (Exception e) {
            Log.e(TAG, e.getMessage() == null ? "" : e.getMessage());
            callbackContext.error(e.getMessage());
        }
    }

    private String getManufacturer() {
        return Build.MANUFACTURER.toLowerCase();
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        try {
            Bundle bundle = intent.getExtras();
            Log.d(TAG, "pushplugin onNewIntent bundle != null " + (bundle != null));
            if (bundle != null) {
                JSONObject jsonObject = new JSONObject();
                for(String k:bundle.keySet()){
                    Log.d(TAG, "pushplugin onNewIntent key " + k+" = "+bundle.get(k));
                    jsonObject.put(k,bundle.get(k));
                }
                sendMessage(jsonObject, true);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            if (!TextUtils.isEmpty(e.getMessage())) {
                Log.d(PushPlugin.TAG, e.getMessage());
            }
        }
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (TextUtils.equals("getToken", action)) {
            String appId = args.optString(0);
            sMTokenCallback = callbackContext;
            getToken(appId);
            return true;
        }
        if (TextUtils.equals("registerMiPush", action)) {
            String appId = args.optString(0);
            String appKey = args.optString(1);
            cordova.getThreadPool().execute(() -> {
                registerPushMiPushClient(appId, appKey, callbackContext);
            });
            return true;
        }
        if (TextUtils.equals("getManufacturer", action)) {
            String m = getManufacturer();
            Log.d(TAG, "getManufacturer " + m);
            callbackContext.success(m);
            return true;
        }
        if (TextUtils.equals("getToken", action)) {
            String appId = args.optString(0);
            sMTokenCallback = callbackContext;
            getToken(appId);
            return true;
        }
        if (TextUtils.equals("subscribeMessage", action)) {
            sMMessageCallbackContext = callbackContext;
            PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);
            return true;
        }
        if (TextUtils.equals("setAutoInitEnabled", action)) {
            boolean isAutoInitEnabled = args.optBoolean(0);
            setAutoInitEnabled(isAutoInitEnabled);
            callbackContext.success();
            return true;
        }
        if (TextUtils.equals("deleteToken", action)) {
            String appId = args.optString(0);
            deleteToken(appId, callbackContext);
            return true;
        }
        if (TextUtils.equals("initViVoPush", action)) {
            initViVoPush(callbackContext);
            return true;
        }
        if (TextUtils.equals("registerViVoToken", action)) {
            sMViVoPushRegisterCallbackContext = callbackContext;
            String appId = args.optString(0);
            String appKey = args.optString(1);
            String appSecret = args.optString(2);
            registerViVoToken(appId, appKey, appSecret, callbackContext);
            return true;
        }
        if (TextUtils.equals("getOppoRegisterId", action)) {
            String appKey = args.optString(0);
            String appSecret = args.optString(1);
            getOppoRegisterId(appKey, appSecret, callbackContext);
            return true;
        }
        return super.execute(action, args, callbackContext);
    }

    private void deleteToken(String appId, CallbackContext callbackContext) {
        // 创建一个新线程
        new Thread() {
            @Override
            public void run() {
                try {
                    // 从agconnect-service.json文件中读取appId

                    // 输入token标识"HCM"
                    String tokenScope = "HCM";

                    // 注销Token
                    HmsInstanceId.getInstance(cordova.getContext()).deleteToken(appId, tokenScope);
                    Log.i(TAG, "token deleted successfully");
                    callbackContext.success("token deleted successfully");
                } catch (ApiException e) {
                    Log.e(TAG, "deleteToken failed." + e);
                    callbackContext.error(e.getMessage());
                }
            }
        }.start();
    }

    private void getToken(String appId) {
        // 创建一个新线程
        cordova.getThreadPool().execute(() -> {
            try {
                // 从agconnect-service.json文件中读取appId

                // 输入token标识"HCM"
                String tokenScope = "HCM";
                String token = HmsInstanceId.getInstance(cordova.getActivity()).getToken(appId,
                        tokenScope);
                Log.i(TAG, "get token: " + token);

                // 判断token是否为空
                if (!TextUtils.isEmpty(token)) {
                    sMTokenCallback.success(token);
                } else {
                    // 等待onNewToken方法返回
//                      sMTokenCallback.error("token 获取不到请检从agconnect-service" +
//                                ".json文件中读取appId或者后天的配置");
                }
            } catch (ApiException e) {
                Log.e(TAG, "get token failed, " + e);
//                    callbackContext.error(e.getMessage());
            }
        });

    }

    private void setAutoInitEnabled(final boolean isEnable) {
        if (isEnable) {
            // 设置自动初始化
            HmsMessaging.getInstance(cordova.getContext()).setAutoInitEnabled(true);
        } else {
            // 禁止自动初始化
            HmsMessaging.getInstance(cordova.getContext()).setAutoInitEnabled(false);
        }
    }

    public static void sendMessage(JSONObject info, boolean keepCallback) {
        if (PushPlugin.sMMessageCallbackContext != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, info);
            result.setKeepCallback(keepCallback);
            PushPlugin.sMMessageCallbackContext.sendPluginResult(result);
        }
    }

    private void getOppoRegisterId(String appKey, String appSecret,
                                   CallbackContext callbackContext) {

        cordova.getThreadPool().execute(() -> {
            HeytapPushManager.init(cordova.getContext().getApplicationContext(), true);
            HeytapPushManager.register(cordova.getContext().getApplicationContext(), appKey, appSecret,
                    new ICallBackResultService() {
                        @Override
                        public void onRegister(int i, String s) {
                            if (i == 0) {
                                Log.d(TAG,"getOppoRegisterId "+s);
                                callbackContext.success(s);
                            } else {
                                callbackContext.error(i);
                            }
                        }

                        @Override
                        public void onUnRegister(int i) {
                            Log.d(TAG,"getOppoRegisterId onUnRegister res "+i);
                        }

                        @Override
                        public void onSetPushTime(int i, String s) {

                            Log.d(TAG,"getOppoRegisterId onSetPushTime res "+i);
                        }

                        @Override
                        public void onGetPushStatus(int i, int i1) {
                            Log.d(TAG,"getOppoRegisterId onGetPushStatus res "+i);

                        }

                        @Override
                        public void onGetNotificationStatus(int i, int i1) {
                            Log.d(TAG,"getOppoRegisterId onGetNotificationStatus res "+i);

                        }
                    });
            Log.d(TAG,"HeytapPushManager.getPushVersionCode() "+HeytapPushManager.getPushVersionCode()+" HeytapPushManager.getSDKVersion()"+HeytapPushManager.getSDKVersion());
        });

    }

    private void registerViVoToken(String appId, String appKey, String appSecret,
                                   CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            VUpsManager.getInstance().registerToken(cordova.getActivity(), appId, appKey, appSecret,
                    new UPSRegisterCallback() {
                        @Override
                        public void onResult(TokenResult tokenResult) {
                            if (tokenResult.getReturnCode() == 0) {
                                Log.d(TAG, "注册成功 regID = " + tokenResult.getToken());
                                callbackContext.success(tokenResult.getToken());
                            } else {
                                Log.d(TAG, "注册失败");
                                callbackContext.error("注册失败");
                            }
                        }
                    });
        });
    }

    private void initViVoPush(CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            //初始化push
            try {
                if (smIsViVoInit) {
                    return;
                }
                PushClient.getInstance(cordova.getContext().getApplicationContext()).initialize();
                // 打开push开关, 关闭为turnOffPush，详见api接入文档
                PushClient.getInstance(cordova.getContext().getApplicationContext()).turnOnPush(new IPushActionListener() {
                    @Override
                    public void onStateChanged(int state) {
                        // TODO: 开关状态处理， 0代表成功
                        smIsViVoInit = state == 0;
                        callbackContext.success("0代表成功, state = " + state + "");
                    }
                });
            } catch (VivoPushException e) {
                e.printStackTrace();
                callbackContext.error(e.getMessage());
            }
        });


    }
}

