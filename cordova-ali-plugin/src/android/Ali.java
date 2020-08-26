package com.beeant.plugin.ali;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;

import com.alipay.sdk.app.PayTask;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

import static android.app.Activity.RESULT_OK;

public class Ali extends CordovaPlugin {
    public static CallbackContext sCallbackContext;
    public static final String TAG = "Ali";
    public static CallbackContext sPayH5UrlCallbackContext;
    private static final int Pay_H5_Url_Request_Code = 0X0001;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        sCallbackContext = callbackContext;
        if (TextUtils.equals("pay", action)) {
            String payInfo = args.optString(0);
            pay(payInfo, callbackContext);
            return true;
        }
        if (TextUtils.equals("isAliPayInstalled", action)) {
            if (isAliPayInstalled(cordova.getContext(), args.optString(0))) {
                callbackContext.success("ok");
            } else {
                callbackContext.error("not install");
            }
            return true;
        }
        if (TextUtils.equals("payH5Url", action)) {
            payH5Url(args.optString(0),args.optString(1),args.optString(2), callbackContext);
            return true;
        }
        return super.execute(action, args, callbackContext);
    }

    /**
     * 检测是否安装支付宝
     *
     * @param context
     * @return
     */
    public static boolean isAliPayInstalled(Context context, String apkName) {
        Uri uri = Uri.parse(TextUtils.isEmpty(apkName) ? "alipays://platformapi/startApp" : apkName);
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        ComponentName componentName = intent.resolveActivity(context.getPackageManager());
        return componentName != null;
    }

    private void pay(String orderInfo, CallbackContext callbackContext) {// 订单信息
        // 必须异步调用
        cordova.getThreadPool().execute(() -> {
            try {
                PayTask alipay = new PayTask(cordova.getActivity());
                Map<String, String> result = alipay.payV2(orderInfo, true);
                JSONObject res = new JSONObject();
                if (result == null) {
                    callbackContext.error("支付失败，返回的支付对象为空");
                    return;
                }
//                for (String k : result.keySet()) {
//                    Log.d(TAG,"key="+k+", value="+result.get(k));
//                    res.put(k,result.get(k));
//                }
                callbackContext.success(res);
            } catch (Exception e) {
                Log.d(TAG, e.getMessage());
                callbackContext.error(e.getMessage());
            }

        });
    }

    public void payH5Url(String h5PayUrl,String openId,String appId, CallbackContext callbackContext) {
        sPayH5UrlCallbackContext = callbackContext;
        Intent intent = new Intent(cordova.getActivity(), MyH5PayActivity.class);
        Bundle extras = new Bundle();
        /**
         * url是测试的网站，在app内部打开页面是基于webview打开的，demo中的webview是H5PayDemoActivity，
         * demo中拦截url进行支付的逻辑是在H5PayDemoActivity中shouldOverrideUrlLoading方法实现，
         * 商户可以根据自己的需求来实现
         */
        String url = h5PayUrl;
        // url可以是一号店或者淘宝等第三方的购物wap站点，在该网站的支付过程中，支付宝sdk完成拦截支付
        extras.putString("url", url);
        extras.putString("appId", appId);
        extras.putString("openId", openId);
        intent.putExtras(extras);
        cordova.getActivity().startActivityForResult(intent, Pay_H5_Url_Request_Code);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode == Pay_H5_Url_Request_Code) {
            Bundle bundle = intent.getExtras();
            if (sPayH5UrlCallbackContext != null&&bundle!=null) {
                if(resultCode!=RESULT_OK){
                    sPayH5UrlCallbackContext.error("尚未返回支付结果");
                    return;
                }
                JSONObject jsonObject = new JSONObject();
                try {
                    jsonObject.putOpt("payResultCode", bundle.getString("resultCode"));
                    jsonObject.putOpt("payReturnUrl", bundle.getString("payReturnUrl"));
                } catch (JSONException e) {
                    sPayH5UrlCallbackContext.error(e.getMessage());
                    e.printStackTrace();
                }
                sPayH5UrlCallbackContext.success(jsonObject);
            }
        }
    }
    //    public void payH5Url( String h5PayUrl,CallbackContext callbackContext) {
//        cordova.getThreadPool().execute(() -> {
//            try {
//                /**
//                 * 推荐采用的新的二合一接口(payInterceptorWithUrl),只需调用一次
//                 */
//                final PayTask task = new PayTask(cordova.getActivity());
//                /**
//                 * 支付宝H5支付URL拦截器，完成拦截及支付方式转化
//                 *
//                 * @param h5PayUrl          待过滤拦截的 URL
//                 * @param isShowPayLoading  是否出现loading
//                 * @param callback          异步回调接口
//                 *
//                 * @return true：表示URL为支付宝支付URL，URL已经被拦截并支付转化；false：表示URL非支付宝支付URL；
//                 *
//                 */
//                boolean isIntercepted = task.payInterceptorWithUrl(h5PayUrl, true, new H5PayCallback() {
//                    @Override
//                    public void onPayResult(final H5PayResultModel result) {
//                        // 支付结果返回
//                        final String url = result.getReturnUrl();
//                        if (!TextUtils.isEmpty(url)) {
//                            cordova.getActivity().runOnUiThread(new Runnable() {
//                                @Override
//                                public void run() {
//                                    JSONObject jsonObject=new JSONObject();
//                                    try {
//                                        jsonObject.putOpt("url",url);
//                                        jsonObject.putOpt("resultCode",result.getResultCode());
//                                    } catch (JSONException e) {
//                                        e.printStackTrace();
//                                    }
//                                    callbackContext.success(jsonObject);
//                                }
//                            });
//                        }
//                    }
//                });
//
//                /**
//                 * 判断是否成功拦截
//                 * 若成功拦截，则无需继续加载该URL；否则继续加载
//                 */
//                if (!isIntercepted) {
//                    callbackContext.error("拦截失败需继续加载该URL");
//                }
//            } catch (Exception e) {
//                Log.d(TAG, e.getMessage());
//                callbackContext.error(e.getMessage());
//            }
//
//        });
//    }
}