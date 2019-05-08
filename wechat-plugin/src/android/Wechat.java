package com.beeant.app.wechat;

import android.text.TextUtils;

import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

public  class Wechat extends CordovaPlugin{
    public  static CallbackContext sCallbackContext;
    public static IWXAPI sWxApi;
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        sCallbackContext=callbackContext;
        if(TextUtils.equals("getCode",action)){
            String appId = args.optString(0);
            if(TextUtils.isEmpty(appId)){
                callbackContext.error("appId 不能为空");
                return true;
            }
            regToWx(appId);
            cordova.getThreadPool().execute(() -> {
                SendAuth.Req req = new SendAuth.Req();
                req.scope = "snsapi_userinfo";
                req.state = "wechat_sdk_demo_test";
                sWxApi.sendReq(req);
            });
            return true;
        }
        return super.execute(action, args, callbackContext);
    }
    private void regToWx(String appId) {
        // 通过WXAPIFactory工厂，获取IWXAPI的实例
        sWxApi = WXAPIFactory.createWXAPI(cordova.getContext(), appId, true);

        // 将应用的appId注册到微信
        sWxApi.registerApp(appId);

        //建议动态监听微信启动广播进行注册到微信
//        registerReceiver(new BroadcastReceiver() {
//            @Override
//            public void onReceive(Context context, Intent intent) {
//
//                // 将该app注册到微信
//                sWxApi.registerApp(appId);
//            }
//        }, new IntentFilter(ConstantsAPI.ACTION_REFRESH_WXAPP));

    }
}