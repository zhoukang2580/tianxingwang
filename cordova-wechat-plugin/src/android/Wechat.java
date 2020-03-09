package com.beeant.plugin.wechat;

import android.text.TextUtils;

import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.modelpay.PayReq;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Wechat extends CordovaPlugin {
    public static CallbackContext sCallbackContext;
    public static IWXAPI sWxApi;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        sCallbackContext = callbackContext;
        if(TextUtils.equals("isWXAppInstalled",action)){
            cordova.getThreadPool().execute(()->{
                isWXAppInstalled(args.optString(0),callbackContext);
            });
            return true;
        }
        if (TextUtils.equals("getCode", action)) {
            String appId = args.optString(0);
            if (TextUtils.isEmpty(appId)) {
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
        if (TextUtils.equals("pay", action)) {
            try {
                JSONObject jsonObject = args.optJSONObject(0);
                if (jsonObject == null) {
                    callbackContext.error("对象不能空");
                    return true;
                }
                String appId = jsonObject.optString("appId");
                if (TextUtils.isEmpty(appId)) {
                    callbackContext.error("appId 不能空");
                    return true;
                }
                regToWx(appId);
                String partnerId = jsonObject.optString("partnerId");
                if (TextUtils.isEmpty(partnerId)) {
                    callbackContext.error("partnerId 不能空");
                    return true;

                }
                String prepayId = jsonObject.optString("prepayId");
                if (TextUtils.isEmpty(prepayId)) {
                    callbackContext.error("prepayId 不能空");
                    return true;
                }
                String packageValue = jsonObject.optString("packageValue");
                if (TextUtils.isEmpty(packageValue)) {

                    callbackContext.error("packageValue 不能空");
                    return true;
                }
                String nonceStr = jsonObject.optString("nonceStr");
                if (TextUtils.isEmpty(nonceStr)) {

                    callbackContext.error("nonceStr 不能空");
                    return true;
                }
                String timeStamp = jsonObject.optString("timeStamp");
                if (TextUtils.isEmpty(timeStamp)) {

                    callbackContext.error("timeStamp 不能空");
                    return true;
                }
                String sign = jsonObject.optString("sign");
                if (TextUtils.isEmpty(sign)) {
                    callbackContext.error("sign 不能空");
                    return true;

                }
                pay(appId, partnerId, prepayId, packageValue, nonceStr, timeStamp, sign);
            } catch (Exception e) {
                callbackContext.error(e.getMessage());
            }
            return true;
        }
        return super.execute(action, args, callbackContext);
    }

    private void pay(String appId, String partnerId, String prepayId, String packageValue, String nonceStr, String timeStamp, String sign) {
        PayReq request = new PayReq();
        request.appId = appId;// "wxd930ea5d5a258f4f";
        request.partnerId = partnerId;// "1900000109";
        request.prepayId = prepayId;//"1101000000140415649af9fc314aa427",;
        request.packageValue = packageValue;// "Sign=WXPay";
        request.nonceStr = nonceStr;//"1101000000140429eb40476f8896f4c9";
        request.timeStamp = timeStamp;//"1398746574";
        request.sign = sign;// "7FFECB600D7157C5AA49810D2D8F28BC2811827B";
        cordova.getThreadPool().execute(() -> sWxApi.sendReq(request));
    }
    private  void isWXAppInstalled(String appId,CallbackContext callbackContext){
        regToWx(appId);
        if(sWxApi.isWXAppInstalled()){
            callbackContext.success("ok");
        }else {
         callbackContext.error("uninstalled");
        }

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