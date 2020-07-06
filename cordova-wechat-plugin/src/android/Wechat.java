package com.beeant.plugin.wechat;

import android.text.TextUtils;

import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.modelmsg.SendMessageToWX;
import com.tencent.mm.opensdk.modelmsg.WXMediaMessage;
import com.tencent.mm.opensdk.modelmsg.WXTextObject;
import com.tencent.mm.opensdk.modelmsg.WXWebpageObject;
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
        if(TextUtils.equals("share",action)){
            cordova.getThreadPool().execute(()->{
                share(args.optJSONObject(0),callbackContext);
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
    private void share(JSONObject shareInfo,CallbackContext callbackContext){
        try{
            String appId=shareInfo.optString("appId");
            regToWx(appId);
            String type=shareInfo.optString("shareType");
            if(TextUtils.equals("WXTextObject",type)){
                //初始化一个 WXTextObject 对象，填写分享的文本内容
                WXTextObject wxTextObject=new WXTextObject();
                wxTextObject.text=shareInfo.optString("data");
                shareWXTextObject(callbackContext,wxTextObject);
                return;
            }
            if(TextUtils.equals("WXWebpageObject",type)){
                //初始化一个 WXTextObject 对象，填写分享的文本内容
                WXWebpageObject webpageObject=new WXWebpageObject();
                JSONObject data=shareInfo.optJSONObject("data");
                webpageObject.webpageUrl=data.optString("webpageUrl");
                shareWXWebpageObject(callbackContext,webpageObject,data.optString("webTitle"),data.optString("webDescription"),data.optString("openId"));
                return;
            }
        }catch (Exception ex){
            callbackContext.error(ex.getMessage());
        }

    }
    private void shareWXMediaMessage(CallbackContext callbackContext, WXMediaMessage wxMediaMessage){
        callbackContext.success();
    }
    private void shareWXTextObject(CallbackContext callbackContext, WXTextObject textObj){
        //用 WXTextObject 对象初始化一个 WXMediaMessage 对象
        WXMediaMessage msg = new WXMediaMessage();
        msg.mediaObject = textObj;
        msg.description = textObj.text;
        SendMessageToWX.Req req = new SendMessageToWX.Req();
        // 对应该请求的事务 ID，通常由 Req 发起，回复 Resp 时应填入对应事务 ID
        req.transaction = buildTransaction("text");
        req.message = msg;
        // 分享到对话
        req.scene = SendMessageToWX.Req.WXSceneSession;
        //调用api接口，发送数据到微信
        cordova.getThreadPool().execute(() -> {
            callbackContext.success();
            sWxApi.sendReq(req);
        });
    }
    private void shareWXWebpageObject (CallbackContext callbackContext, WXWebpageObject webpage,String title,String webDescription,String openId){

        // 用 WXWebpageObject 对象初始化一个 WXMediaMessage 对象
        WXMediaMessage msg = new WXMediaMessage(webpage);
        msg.title =TextUtils.isEmpty(title)? "分享页面":title;
        msg.description =TextUtils.isEmpty(webDescription)? "网页描述":webDescription;
        //构造一个Req
        SendMessageToWX.Req req = new SendMessageToWX.Req();
        req.transaction = buildTransaction("webpage");
        req.message =msg;
        req.scene =SendMessageToWX.Req.WXSceneSession;
        if(!TextUtils.isEmpty(openId)){
            req.userOpenId = openId;
        }
        //调用api接口，发送数据到微信
        cordova.getThreadPool().execute(() -> {
            callbackContext.success();
            sWxApi.sendReq(req);
        });
    }
    /**
     * 构建一个唯一标志
     *
     * @param type 分享的类型分字符串
     * @return 返回唯一字符串
     */
    private static String buildTransaction(String type) {
        return (type == null) ? String.valueOf(System.currentTimeMillis()) : type + System.currentTimeMillis();
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