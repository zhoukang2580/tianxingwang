package com.beeant.plugin.ali;

import com.alipay.sdk.app.H5PayCallback;
import com.alipay.sdk.app.PayTask;
import com.alipay.sdk.util.H5PayResultModel;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.res.Configuration;
import android.graphics.Bitmap;
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

import org.apache.cordova.LOG;

public class MyH5PayActivity extends Activity {
	private final String TAG="MyH5PayActivity";
	private WebView mWebView;
	private H5PayResultModel h5PayResultModel;
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
		LinearLayout layout = new LinearLayout(getApplicationContext());
		LayoutParams params = new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
		layout.setOrientation(LinearLayout.VERTICAL);
		setContentView(layout, params);
		mWebView = new WebView(getApplicationContext());
		params.weight = 1;
		mWebView.setVisibility(View.VISIBLE);
		layout.addView(mWebView, params);
		initWebViewSettings();
		mWebView.setWebViewClient(new MyWebViewClient());
		mWebView.loadUrl(url);
	}
	private  void  showMessage(String msg){
		runOnUiThread(()->{
			new AlertDialog.Builder(MyH5PayActivity.this).setTitle("提示")
					.setMessage(msg)
					.setPositiveButton("确定", new OnClickListener() {

						@Override
						public void onClick(DialogInterface arg0, int arg1) {
//						finish();
						}
					}).show();
		});

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
		LOG.d(TAG, TAG+" is running on device made by: " + manufacturer);
		//We don't save any form data in the application
		settings.setSaveFormData(false);
		settings.setSavePassword(false);

		// Jellybean rightfully tried to lock this down. Too bad they didn't give us a whitelist
		// while we do this
		settings.setAllowUniversalAccessFromFileURLs(true);
		settings.setMediaPlaybackRequiresUserGesture(false);

		// Enable database
		// We keep this disabled because we use or shim to get around DOM_EXCEPTION_ERROR_16
		String databasePath = mWebView.getContext().getApplicationContext().getDir("database", Context.MODE_PRIVATE).getPath();
		settings.setDatabaseEnabled(true);
		settings.setDatabasePath(databasePath);


		//Determine whether we're in debug or release mode, and turn on Debugging!
//		ApplicationInfo appInfo = mWebView.getContext().getApplicationContext().getApplicationInfo();


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
			mWebView.goBack();
		} else {
			if(h5PayResultModel!=null){
				Intent intent =new Intent();
				Bundle bundle=new Bundle();
				bundle.putString("payResultCode",h5PayResultModel.getResultCode());
				bundle.putString("payReturnUrl",h5PayResultModel.getReturnUrl());
				intent.putExtras(intent);
				setResult(RESULT_OK,intent);
			}
			finish();
		}
	}
	private  String getMessage(String code){
		if("9000".equals(code))
			return "订单支付成功";
		if("8000".equals(code))
			return "正在处理中，支付结果未知";
		if("4000".equals(code))
			return "订单支付失败";
		if("6001".equals(code))
			return "用户中途取消";
		if("6002".equals(code))
			return "网络连接出错";
		if("6004".equals(code))
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

	private class MyWebViewClient extends WebViewClient {
		@Override
		public void onPageStarted(WebView view, String url, Bitmap favicon) {
			super.onPageStarted(view, url, favicon);
			Log.d(TAG,"onPageStarted url"+url);
		}

		@Override
		public boolean shouldOverrideUrlLoading(final WebView view, String url) {
			Log.d(TAG," shouldOverrideUrlLoading "+url);
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
					Log.d("PayH5Activiti","支付结果返回 = "+result.getResultCode()+" getResultCode="+result.getResultCode());
					h5PayResultModel=result;
					final String url = result.getReturnUrl();
					showMessage(getMessage(result.getResultCode()));
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
			Log.d(TAG,"isIntercepted = "+isIntercepted+" ");
			if (!isIntercepted) {
				view.loadUrl(url);
			}
			return true;
		}

	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		if (mWebView != null) {
			mWebView.removeAllViews();
			try {
				mWebView.destroy();
			} catch (Throwable t) {
			}
			mWebView = null;
		}
	}
}
