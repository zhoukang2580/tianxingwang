package com.beeant.plugin.hcp;

import android.content.SharedPreferences;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import com.beeant.plugin.hcp.utils.MD5;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaResourceApi;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.File;
import java.io.IOException;

public class Hcp extends CordovaPlugin {
    private final String TAG = "HCP";
    private static final String FILE_PREFIX = "file://";
    private static final String LOCAL_ASSETS_FOLDER = "file:///android_asset/www";
    SharedPreferences preferences;
    CallbackContext mMallbackContext;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        preferences = cordova.getActivity().getPreferences(0);

    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
        String path = this.preferences.getString("loadIndexPagePath", null);
        Log.d("Hcp", "热更插件加载页面 " + path);
        if (path != null) {
            openHcpPage(path, mMallbackContext);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (TextUtils.equals("openHcpPage", action)) {
            mMallbackContext = callbackContext;
            this.openHcpPage(args.optString(0), callbackContext);
            return true;
        }
        if (TextUtils.equals("getHash", action)) {
            mMallbackContext = callbackContext;
            cordova.getThreadPool().execute(()->{
             this.getHash(args.optString(0),callbackContext);
            });
            return true;
        }
        return super.execute(action, args, callbackContext);
    }



    private void openHcpPage(String path, CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (TextUtils.isEmpty(path)) {
                    if (callbackContext != null)
                        callbackContext.error("路径不存在");
                    return;
                }
                CordovaResourceApi resourceApi = webView.getResourceApi();
                File f= resourceApi.mapUriToFile(getUriForArg(path));
                Log.d(TAG, "是否是文件夹 " + f.isDirectory() + " 文件是否存在 " + f.exists());
                if (!f.exists()) {
                    if (null != callbackContext) {
                        callbackContext.error("index.html文件不存在，路径" + FILE_PREFIX + f.getPath());
                    }
                    Log.d(TAG,"index.html文件不存在，路径" + FILE_PREFIX + f.getPath());
                    return;
                }
                File indexFile = new File(new File(f.getParent(),"www").getAbsoluteFile(),"index.html");
                if(!indexFile.exists()){
                    Log.d(TAG,"indexfile 不存在");
                    return;
                }
                try {
                    preferences.edit().putString("loadIndexPagePath", path).apply();
                    Log.d(TAG, "loadUrlIntoView indexFile.getAbsolutePath()=" + indexFile.getAbsolutePath());
                    Log.d(TAG, "loadUrlIntoView FILE_PREFIX+indexFile.getAbsolutePath()=" + FILE_PREFIX+indexFile.getAbsolutePath());
                    cordova.getActivity().runOnUiThread(()->{
                        webView.clearHistory();
                        webView.loadUrlIntoView(FILE_PREFIX+indexFile.getAbsolutePath(), false);
                    });
                } catch (Exception e) {
                    cordova.getActivity().runOnUiThread(()->{
                        preferences.edit().putString("loadIndexPagePath", null).apply();
                        Log.e(TAG, e.getMessage());
                        webView.loadUrl(LOCAL_ASSETS_FOLDER + File.separator + "index.html");
                    });

                }
            }
        });
    }
    private  void getHash(String path,CallbackContext callbackContext){

        this.checkPathOrFileExists(path,callbackContext);
        CordovaResourceApi resourceApi = webView.getResourceApi();
        File file= resourceApi.mapUriToFile(getUriForArg(path));
        cordova.getThreadPool().execute(()->{
            MD5 md5 = MD5.getInstance();
            try {
                String hash= md5.getHash(file.getAbsolutePath());
                callbackContext.success(hash);
            } catch (IOException e) {
                callbackContext.error(e.getMessage());
                e.printStackTrace();
            }
        });
    }
    private void checkPathOrFileExists(String path,CallbackContext callbackContext){
        CordovaResourceApi resourceApi = webView.getResourceApi();
        File file= resourceApi.mapUriToFile(getUriForArg(path));
        if(TextUtils.isEmpty(path)){
            callbackContext.error("路径不能为空");
            return ;
        }
        if(!file.exists()){
             Log.d(TAG,"文件不存在 path= "+file.getAbsolutePath());
            callbackContext.error("文件不存在");
            return;
        }
    }
    private Uri getUriForArg(String arg) {
        CordovaResourceApi resourceApi = webView.getResourceApi();
        Uri tmpTarget = Uri.parse(arg);
        return resourceApi.remapUri(
                tmpTarget.getScheme() != null ? tmpTarget : Uri.fromFile(new File(arg)));
    }
}
