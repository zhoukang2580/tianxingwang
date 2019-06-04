package com.beeant.plugin.ali;

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
        return super.execute(action, args, callbackContext);
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