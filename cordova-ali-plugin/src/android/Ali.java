package com.beeant.plugin.ali;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import com.alipay.sdk.app.PayTask;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class Ali extends CordovaPlugin {
    public static CallbackContext sCallbackContext;
    public static final String TAG = "Ali";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        sCallbackContext = callbackContext;
        if (TextUtils.equals("pay", action)) {
            String payInfo = args.optString(0);
            pay(payInfo, callbackContext);
            return true;
        }
        if (TextUtils.equals("isAliPayInstalled", action)) {
            if(isAliPayInstalled(cordova.getContext())){
                callbackContext.success("ok");
            }else{
                callbackContext.error("not install");
            }
            return true;
        }
        return super.execute(action, args, callbackContext);
    }
    /**
     * 检测是否安装支付宝
     * @param context
     * @return
     */
    public static boolean isAliPayInstalled(Context context) {
        Uri uri = Uri.parse("alipays://platformapi/startApp");
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
}