package com.beeant.plugin.ali;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.AlertDialog;
import android.text.TextUtils;
import android.util.Log;
import android.webkit.WebView;

import com.alipay.sdk.app.H5PayActivity;
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
            if(isAliPayInstalled(cordova.getContext(),args.optString(0))){
                callbackContext.success("ok");
            }else{
                callbackContext.error("not install");
            }
            return true;
        }
        if (TextUtils.equals("payWebUrl", action)) {
            boolean ok=payWebUrl(args.optString(0));
            if(ok){
                callbackContext.success("唤起支付成功");
            }else{
                callbackContext.error("唤起支付宝失败");
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
    public static boolean isAliPayInstalled(Context context,String apkName) {
        Uri uri = Uri.parse(TextUtils.isEmpty(apkName)?"alipays://platformapi/startApp":apkName);
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
    public boolean payWebUrl( String url) {
        // 获取上下文, H5PayDemoActivity为当前页面
        final Activity context = cordova.getActivity();

        // ------  对alipays:相关的scheme处理 -------
        if(url.startsWith("alipays:") || url.startsWith("alipay")||url.contains("mclient.alipay.com")) {
            try {
                context.startActivity(new Intent("android.intent.action.VIEW", Uri.parse(url)));
            } catch (Exception e) {
                new AlertDialog.Builder(context)
                        .setMessage("未检测到支付宝客户端，请安装后重试。")
                        .setPositiveButton("立即安装", new DialogInterface.OnClickListener() {

                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                Uri alipayUrl = Uri.parse("https://d.alipay.com");
                                context.startActivity(new Intent("android.intent.action.VIEW", alipayUrl));
                            }
                        }).setNegativeButton("取消", null).show();
            }
            return true;
        }
        // ------- 处理结束 -------

//        if (!(url.startsWith("http") || url.startsWith("https"))) {
//            return false;
//        }

        return false;
    }
}