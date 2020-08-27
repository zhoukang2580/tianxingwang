package com.beeant.plugin.ali;

import com.alipay.sdk.app.H5PayCallback;
import com.alipay.sdk.app.PayTask;
import com.alipay.sdk.util.H5PayResultModel;
import com.beeant.plugin.wechat.Wechat;
import com.tencent.mm.opensdk.modelmsg.SendMessageToWX;
import com.tencent.mm.opensdk.modelmsg.WXMediaMessage;
import com.tencent.mm.opensdk.modelmsg.WXTextObject;
import com.tencent.mm.opensdk.modelmsg.WXWebpageObject;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.LOG;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

public class MyH5PayActivity extends Activity {
    private final String TAG = "MyH5PayActivity";
    private String appId = "wx0839a418ccafdf36";
    private String openId;
    private WebView mWebView;
    private IWXAPI sWxApi;
    private H5PayResultModel h5PayResultModel;
    private static final int sH5payResultReqCode = 0x1111;
    private LinearLayout linearLayout;
    private boolean isInitiateWeixinPay = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Bundle extras = null;
        try {
            extras = getIntent().getExtras();
        } catch (Exception e) {
            finish();
            return;
        }
        if (extras == null) {
            finish();
            return;
        }
        String url = null;
        try {
            url = extras.getString("url");
            String appId = extras.getString("appId");
            if (!TextUtils.isEmpty(appId)) {
                this.appId = appId;
            }
            String openId = extras.getString("openId");
            if (!TextUtils.isEmpty(openId)) {
                this.openId = openId;
            }
        } catch (Exception e) {
            finish();
            return;
        }
        if (TextUtils.isEmpty(url)) {
            // 测试H5支付，必须设置要打开的url网站
            new AlertDialog.Builder(MyH5PayActivity.this).setTitle("警告")
                    .setMessage("必须配置需要打开的url 站点")
                    .setPositiveButton("确定", new OnClickListener() {

                        @Override
                        public void onClick(DialogInterface arg0, int arg1) {
                            finish();
                        }
                    }).show();

        }
        super.requestWindowFeature(Window.FEATURE_NO_TITLE);
        linearLayout = new LinearLayout(getApplicationContext());
        LayoutParams params = new LayoutParams(LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT);
        linearLayout.setOrientation(LinearLayout.VERTICAL);
        setContentView(linearLayout, params);
        mWebView = new WebView(getApplicationContext());
        params.weight = 1;
        mWebView.setVisibility(View.VISIBLE);
        linearLayout.addView(mWebView, params);
        initWebViewSettings();
        mWebView.setWebViewClient(new MyWebViewClient());
        mWebView.loadUrl(url);
    }

    /**
     * 构建一个唯一标志
     *
     * @param type 分享的类型分字符串
     * @return 返回唯一字符串
     */
    private static String buildTransaction(String type) {
        return (type == null) ? String.valueOf(System.currentTimeMillis()) :
                type + System.currentTimeMillis();
    }

    private void regToWx(String appId) {
        // 通过WXAPIFactory工厂，获取IWXAPI的实例
        sWxApi = WXAPIFactory.createWXAPI(this.getApplicationContext(), appId, true);
        Wechat.sWxApi = sWxApi;
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

    private void showMessage(String msg, boolean isGoBack) {
        runOnUiThread(() -> {
            new AlertDialog.Builder(MyH5PayActivity.this).setTitle("提示")
                    .setMessage(msg)
                    .setPositiveButton("确定", new OnClickListener() {

                        @Override
                        public void onClick(DialogInterface arg0, int arg1) {
//						finish();
                            if (isGoBack) {
                                if (mWebView.canGoBack()) {
                                    mWebView.goBack();
                                }
                            }
                        }
                    }).show();
        });

    }

    private void share(JSONObject shareInfo) {
        try {
            String appId = shareInfo.optString("appId");
            regToWx(appId);
            String type = shareInfo.optString("shareType");
            if (TextUtils.equals("WXTextObject", type)) {
                //初始化一个 WXTextObject 对象，填写分享的文本内容
                WXTextObject wxTextObject = new WXTextObject();
                wxTextObject.text = shareInfo.optString("data");
                shareWXTextObject(wxTextObject);
                return;
            }
            if (TextUtils.equals("WXWebpageObject", type)) {
                //初始化一个 WXTextObject 对象，填写分享的文本内容
                WXWebpageObject webpageObject = new WXWebpageObject();
                JSONObject data = shareInfo.optJSONObject("data");
                if (data != null) {
                    webpageObject.webpageUrl = data.optString("webpageUrl");
                    shareWXWebPageObject(webpageObject,
                            data.optString("webTitle"),
                            data.optString("webDescription"),
                            data.optString("openId"));
                }
            }
        } catch (Exception ex) {
            showMessage(ex.getMessage(), false);
        }

    }

    private void shareWXTextObject(WXTextObject textObj) {
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
        new Thread(() -> {
            sWxApi.sendReq(req);
        }).start();
    }

    private void shareWXWebPageObject(
            WXWebpageObject webpage,
            String title,
            String webDescription,
            String openId) {

        // 用 WXWebpageObject 对象初始化一个 WXMediaMessage 对象
        WXMediaMessage msg = new WXMediaMessage(webpage);
        msg.title = TextUtils.isEmpty(title) ? "分享页面" : title;
        msg.description = TextUtils.isEmpty(webDescription) ? "网页描述" : webDescription;
        //构造一个Req
        SendMessageToWX.Req req = new SendMessageToWX.Req();
        req.transaction = buildTransaction("webpage");
        req.message = msg;
        req.scene = SendMessageToWX.Req.WXSceneSession;
        if (!TextUtils.isEmpty(openId)) {
            req.userOpenId = openId;
        }
        //调用api接口，发送数据到微信
        new Thread(() -> {
            sWxApi.sendReq(req);
        }).start();
    }

    @SuppressLint({"NewApi", "SetJavaScriptEnabled"})
    @SuppressWarnings("deprecation")
    private void initWebViewSettings() {
        mWebView.setInitialScale(0);
        mWebView.setVerticalScrollBarEnabled(false);
        // Enable JavaScript
        final WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);

        String manufacturer = android.os.Build.MANUFACTURER;
        LOG.d(TAG, TAG + " is running on device made by: " + manufacturer);
        //We don't save any form data in the application
        settings.setSaveFormData(false);
        settings.setSavePassword(false);

        // Jellybean rightfully tried to lock this down. Too bad they didn't give us a whitelist
        // while we do this
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Enable database
        // We keep this disabled because we use or shim to get around DOM_EXCEPTION_ERROR_16
        String databasePath = mWebView.getContext().getApplicationContext().getDir("database",
                Context.MODE_PRIVATE).getPath();
        settings.setDatabaseEnabled(true);
        settings.setDatabasePath(databasePath);


        //Determine whether we're in debug or release mode, and turn on Debugging!
//		ApplicationInfo appInfo = mWebView.getContext().getApplicationContext()
//		.getApplicationInfo();


        settings.setGeolocationDatabasePath(databasePath);

        // Enable DOM storage
        settings.setDomStorageEnabled(true);

        // Enable built-in geolocation
        settings.setGeolocationEnabled(true);

        // Enable AppCache
        // Fix for CB-2282
        settings.setAppCacheMaxSize(5 * 1048576);
        settings.setAppCachePath(databasePath);
        settings.setAppCacheEnabled(true);

        // Fix for CB-1405
        // Google issue 4641
        String defaultUserAgent = settings.getUserAgentString();

        // Fix for CB-3360
//		String overrideUserAgent = preferences.getString("OverrideUserAgent", null);
//		if (overrideUserAgent != null) {
//			settings.setUserAgentString(overrideUserAgent);
//		} else {
//			String appendUserAgent = preferences.getString("AppendUserAgent", null);
//			if (appendUserAgent != null) {
//				settings.setUserAgentString(defaultUserAgent + " " + appendUserAgent);
//			}
//		}
        // End CB-3360

//		IntentFilter intentFilter = new IntentFilter();
//		intentFilter.addAction(Intent.ACTION_CONFIGURATION_CHANGED);
//		if (this.receiver == null) {
//			this.receiver = new BroadcastReceiver() {
//				@Override
//				public void onReceive(Context context, Intent intent) {
//					settings.getUserAgentString();
//				}
//			};
//			webView.getContext().registerReceiver(this.receiver, intentFilter);
//		}
        // end CB-1405
    }


    @Override
    public void onBackPressed() {
        if (mWebView.canGoBack()) {
            String curUrl = mWebView.getUrl();
            mWebView.goBack();
            String cur = mWebView.getUrl();
            if (cur != null && cur.equals(curUrl) && mWebView.canGoBack()) {
                mWebView.goBack();
            }
        } else {
            if (h5PayResultModel != null) {
                Intent intent = new Intent();
                Bundle bundle = new Bundle();
                bundle.putString("payResultCode", h5PayResultModel.getResultCode());
                bundle.putString("payReturnUrl", h5PayResultModel.getReturnUrl());
                intent.putExtras(bundle);
                setResult(RESULT_OK, intent);
            } else {
                setResult(RESULT_CANCELED, null);
            }
            finish();
        }
    }

    private String getMessage(String code) {
        if ("9000".equals(code))
            return "订单支付成功";
        if ("8000".equals(code))
            return "正在处理中，支付结果未知";
        if ("4000".equals(code))
            return "订单支付失败";
        if ("6001".equals(code))
            return "用户中途取消";
        if ("6002".equals(code))
            return "网络连接出错";
        if ("6004".equals(code))
            return "支付结果未知";
        return "其他";
    }

    @Override
    public void finish() {
        super.finish();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

    /**
     * 拨打电话（跳转到拨号界面，用户手动点击拨打）
     *
     * @param phoneNum 电话号码
     */
    public void callPhone(String phoneNum) {
        try {
            Intent intent = new Intent(Intent.ACTION_DIAL);
            if (TextUtils.isEmpty(phoneNum)) {
                return;
            }
            Uri data = null;
            if (!phoneNum.contains("tel")) {
                data = Uri.parse("tel:" + phoneNum);
            } else {
                data = Uri.parse(phoneNum);
            }
            intent.setData(data);
            startActivity(intent);
        } catch (Exception e) {
            showMessage(e.getMessage(), false);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        try {
            Log.d(TAG, "onActivityResult requestCode" + requestCode + " resultCode=" + resultCode);
            if (data != null) {
                Log.d(TAG, "onActivityResult Intent data" + data.toString());
                Bundle bundle = data.getExtras();
                if (bundle != null && !bundle.keySet().isEmpty()) {
                    for (String key : bundle.keySet()) {
                        Log.d(TAG,
								"onActivityResult Bundle bundle key=" + key + ",value=" + bundle.get(key) + "\n");
                    }
                }
            }
            super.onActivityResult(requestCode, resultCode, data);
        } catch (Exception ex) {
            Log.d(TAG, "onActivityResult " + ex.getMessage());
        }
    }

    private class MyWebViewClient extends WebViewClient {
        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            Log.d(TAG, "onPageStarted url" + url);
        }

        @Override
        public void doUpdateVisitedHistory(WebView view, String url, boolean isReload) {
            super.doUpdateVisitedHistory(view, url, isReload);
            url = url.toLowerCase();
            if (isInitiateWeixinPay
                    || url.startsWith("wechat")
                    || url.startsWith("weixin:")
                    || url.contains("index")
                    || url.contains("home")
                    || url.contains("login")
            ) {
                view.clearHistory();
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(final WebView view, String url) {
            Log.d(TAG, " shouldOverrideUrlLoading " + url);
            if (url.contains("sharetrips")) {
                JSONObject jsonObject = new JSONObject();
                try {
                    jsonObject.putOpt("appId", appId);
                    jsonObject.putOpt("shareType", "WXWebpageObject");
                    JSONObject data = new JSONObject();
                    data.putOpt("webpageUrl", url);
                    data.putOpt("webTitle", "行程分享");
                    data.putOpt("webDescription", "行程分享");
                    data.putOpt("openId", openId);
                    jsonObject.putOpt("data", data);
                    share(jsonObject);
                } catch (JSONException e) {
                    e.printStackTrace();
                    showMessage(e.getMessage(), false);
                    view.loadUrl(url);
                }
                return true;
            }
            if (url.startsWith("tel:")) {
                callPhone(url);
                return true;
            }
            if (url.startsWith("weixin:") || url.startsWith("wechat")) {
                isInitiateWeixinPay = true;
                Intent intent = new Intent();
                intent.setAction(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(url));
                startActivityForResult(intent, sH5payResultReqCode);
                return true;
            }
            if (!(url.startsWith("http") || url.startsWith("https"))) {
                return true;
            }
            /**
             * 推荐采用的新的二合一接口(payInterceptorWithUrl),只需调用一次
             */
            final PayTask task = new PayTask(MyH5PayActivity.this);
            boolean isIntercepted = task.payInterceptorWithUrl(url, true, new H5PayCallback() {
                @Override
                public void onPayResult(final H5PayResultModel result) {
                    // 支付结果返回
                    Log.d("PayH5Activiti", "支付结果返回 = " + result.getResultCode() + " getResultCode" +
                            "=" + result.getResultCode());
                    h5PayResultModel = result;
//                    final String url = result.getReturnUrl();
//                    showMessage(getMessage(result.getResultCode()),
//                            !"9000".equals(result.getResultCode()));
                    if (!TextUtils.isEmpty(url)) {
                        MyH5PayActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                view.loadUrl(url);
                            }
                        });
                    }
                }
            });

            /**
             * 判断是否成功拦截
             * 若成功拦截，则无需继续加载该URL；否则继续加载
             */
            Log.d(TAG, "isIntercepted = " + isIntercepted + " ");
            if (!isIntercepted) {
                String referer = getReferer(url);
                if (!TextUtils.isEmpty(referer)) {
                    Map<String, String> extraHeaders = new HashMap<>();
                    extraHeaders.put("Referer", referer);
                    view.loadUrl(url, extraHeaders);
                } else {
                    view.loadUrl(url);
                }
            }
            return true;
        }

    }

    private String getReferer(String url) {
        if (url.contains("wx.tenpay.com")) {
            try {
                URL url1 = new URL(url);
                String query = url1.getQuery();
                if (!TextUtils.isEmpty(query)) {
                    query = URLDecoder.decode(query, "UTF-8");
                    String[] arr = query.split("&");
                    String redirectUrl = null;
                    for (String it : arr) {
                        if (it.contains("redirect_url") || it.contains("redirecturl")) {
                            redirectUrl = it;
                            break;
                        }
                    }
                    if (!TextUtils.isEmpty(redirectUrl)) {
                        arr = redirectUrl.split("=");
                        if (arr.length > 1) {
                            if (!TextUtils.isEmpty(arr[1])) {
                                return arr[1];
                            }
                        }
                    }
                }
            } catch (MalformedURLException | UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mWebView != null) {
            mWebView.removeAllViews();
            if (linearLayout != null) {
                linearLayout.removeView(mWebView);
            }
            try {
                mWebView.destroy();
            } catch (Throwable t) {
            }
            mWebView = null;
        }
    }
}
