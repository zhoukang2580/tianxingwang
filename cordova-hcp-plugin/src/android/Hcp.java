package com.beeant.plugin.hcp;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.support.v4.content.FileProvider;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.beeant.plugin.hcp.utils.MD5;
import com.ionicframework.cordova.webview.IonicWebViewEngine;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaResourceApi;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class Hcp extends CordovaPlugin {
    private IonicWebViewEngine ionicWebViewEngine;
    private final String TAG = "HCP";
    private static final String FILE_PREFIX = "file://";
    private static final String LOCAL_ASSETS_FOLDER = "file:///android_asset/www";
    SharedPreferences preferences;
    CallbackContext mMallbackContext;
    private boolean destroyed;
    private static boolean canLoadIntoView = false;

    @Override
    public void pluginInitialize() {
        preferences = cordova.getActivity().getPreferences(0);
        ionicWebViewEngine = (IonicWebViewEngine) webView.getEngine();
        changeBasePath();
        loadHcpPage();
    }

    private void changeBasePath() {
        cordova.getActivity().runOnUiThread(()->{
            String hcpPage = getHcpStartIndex();
            if (!TextUtils.isEmpty(hcpPage)) {
                String base = hcpPage.replace("/index.html", "");
                if (checkInstallNewVersionApk()) {
                    return;
                }
                Log.d(TAG, "base =" + base);
                ionicWebViewEngine.setServerBasePath(base);
            }
            Log.d(TAG, "initialize getServerBasePath=" + (ionicWebViewEngine != null ? ionicWebViewEngine.getServerBasePath() : null));
        });
    }

    @Override
    public boolean onOverrideUrlLoading(String url) {
        Log.d(TAG, "onOverrideUrlLoading Url=" + url);
        return super.onOverrideUrlLoading(url);
    }

    private void showDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(cordova.getActivity());
        builder.setTitle("请回答");
        builder.setMessage("你觉得我好看吗？？");
        builder.setPositiveButton("当然是好看了！！", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                Toast.makeText(cordova.getActivity(), "嘻嘻嘻", Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNeutralButton("我觉得一般", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                Toast.makeText(cordova.getActivity(), "那你再瞅瞅~", Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("我觉得不好看", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                Toast.makeText(cordova.getActivity(), "嘤嘤嘤", Toast.LENGTH_SHORT).show();
            }
        });
        builder.show();
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);


    }

    @Override
    public void onStart() {
        super.onStart();
        loadHcpPage();

    }

    @Override
    public void onPause(boolean multitasking) {
        super.onPause(multitasking);

    }

    @Override
    public void onDestroy() {
        destroyed = true;
        Log.d(TAG, "hcp plugin  onDestroy ");
        super.onDestroy();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "execute action = " + action);
        if (TextUtils.equals("openHcpPage", action)) {
            mMallbackContext = callbackContext;
            this.openHcpPage(args.optString(0), callbackContext);
            return true;
        }
        if (TextUtils.equals("loadHcpPage", action)) {
            callbackContext.success();
            this.loadHcpPage();
            return true;
        }
        if (TextUtils.equals("saveHcpPath", action)) {
            if (TextUtils.isEmpty(args.optString(0))) {
                callbackContext.error("路径不存在");
                return true;
            }
            this.saveHcpPath(args.optString(0), callbackContext);
            return true;
        }
        if (TextUtils.equals("getHash", action)) {
            mMallbackContext = callbackContext;
            cordova.getThreadPool().execute(() -> {
                this.getHash(args.optString(0), callbackContext);
            });
            return true;
        }
        if (TextUtils.equals("getWebViewUrl", action)) {
            cordova.getActivity().runOnUiThread(() -> {
                String url = webView.getUrl();
                Log.d(TAG, "getWebViewUrl " + url);
                callbackContext.success(url);
            });
            return true;
        }
        if (TextUtils.equals("getStartIndexPath", action)) {
            String path = getHcpStartIndex();
            Log.d(TAG, "getStartIndexPath " + path);
            callbackContext.success(path);
            return true;
        }
        if (TextUtils.equals("checkPathOrFileExists", action)) {
            mMallbackContext = callbackContext;
            checkPathOrFileExists(args.optString(0), callbackContext);
            return true;
        }
        if (TextUtils.equals("openAPK", action)) {
            Log.d(TAG, "openAPK " + args.optString(0));
            if (TextUtils.isEmpty(args.optString(0))) {
                callbackContext.error("apk 路径不存在");
                return true;
            }
            cordova.getThreadPool().execute(() -> {
                CordovaResourceApi resourceApi = webView.getResourceApi();
                File file = resourceApi.mapUriToFile(getUriForArg(args.optString(0)));
                openAPK(file.getAbsolutePath(), cordova.getActivity(), callbackContext);
            });
            return true;
        }
        if (TextUtils.equals("getUUID", action)) {
            this.getUUID(callbackContext);
            return true;
        }
        return super.execute(action, args, callbackContext);
    }

    /**
     * Get the device's Universally Unique Identifier (UUID).
     *
     * @return
     */
    private String getUuid() {
        String uuid = Settings.System.getString(this.cordova.getActivity().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
        Log.d(TAG, "getUuid " + uuid);
        return uuid;
    }

    public void getUUID(CallbackContext callbackContext) {
        String uuid = getUuid() + Build.FINGERPRINT;
        Log.d(TAG, "Build.FINGERPRINT: " + Build.FINGERPRINT + " uuid " + uuid);
        MD5 md5 = MD5.getInstance();
        md5.write(uuid.getBytes(StandardCharsets.UTF_8), uuid.getBytes(StandardCharsets.UTF_8).length);
        String hash = md5.calculateHash();
        Log.d(TAG, "hash = " + hash);
        callbackContext.success(hash);


    }

    private String getHcpStartIndex() {
        String loadIndexPagePath = this.preferences.getString("loadIndexPagePath", null);
        Log.d(TAG, "loadIndexPagePath" + loadIndexPagePath);
        return loadIndexPagePath;
    }

    private boolean checkInstallNewVersionApk() {
        String path = getHcpStartIndex();
        String curVersion = this.getVersion();
        Log.d("Hcp", "curVersion: " + curVersion);
        String subVersion = null;
        if (!TextUtils.isEmpty(curVersion)) {
            String[] vers = curVersion.split("\\.");
            subVersion = vers[0] + "_" + vers[1];// 前两位判断是否是主版本更新，最后一位是热更新
            Log.d(TAG, "curversion subVersion" + subVersion);
        }
        Log.d("Hcp", "curVersion: " + subVersion);
        Log.d("Hcp", "热更插件加载页面 " + path + " webView url " + webView.getUrl());
        if (path != null) {
            if (subVersion != null && !path.contains(subVersion)) {
                Log.d(TAG, "安装了新新版本");
                preferences.edit().putString("loadIndexPagePath", null).apply();
                return true;
            }
        }
        return false;
    }

    @Override
    public Object onMessage(String id, Object data) {
        Log.d(TAG, "id=" + id + " data " + data);
        if ("splashscreen".equals(id)) {
            if ("hide".equals(data.toString())) {
//                this.removeSplashScreen(false);
                canLoadIntoView = true;
            } else {
//                this.showSplashScreen(false);
            }
        } else if ("spinner".equals(id)) {
            if ("stop".equals(data.toString())) {
//                getView().setVisibility(View.VISIBLE);
                canLoadIntoView = true;
            }
        } else if ("onReceivedError".equals(id)) {
//            this.spinnerStop();
            canLoadIntoView = true;
        }
        return super.onMessage(id, data);
    }

    private void loadHcpPage() {
        cordova.getActivity().runOnUiThread(()->{

            try {
                String path = getHcpStartIndex();
                String curVersion = this.getVersion();
                Log.d(TAG, "curVersion: " + curVersion);
                String subVersion = null;
                if (!TextUtils.isEmpty(curVersion)) {
                    String[] vers = curVersion.split("\\.");
                    subVersion = vers[0] + "_" + vers[1];// 前两位判断是否是主版本更新，最后一位是热更新
                    Log.d(TAG, "curversion subVersion" + subVersion);
                }
                Log.d(TAG, "curVersion: " + subVersion);
                Log.d(TAG, "热更插件加载页面 " + path + " webView url " + webView.getUrl());
                String webviewUrl = webView.getUrl();
                if (path != null) {
                    if (checkInstallNewVersionApk()) {
                        return;
                    }
                    if (destroyed || null == webviewUrl || !webviewUrl.contains("_app_file_")) {
                        Log.d(TAG, "webview加载热更URL=" + path + " 加载前URL=" + webviewUrl);
                        webView.clearHistory();
                        loadUrlIntoView(path);
                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
                Log.d(TAG, e.getMessage());
            }

        });


    }

    private void saveHcpPath(String path, CallbackContext callbackContext) {
        preferences.edit().putString("loadIndexPagePath", path).apply();
        callbackContext.success();
    }

    private void openAPK(String fileSavePath, Activity activity, CallbackContext callbackContext) {
        try {
            File file = new File(fileSavePath);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            // 由于没有在Activity环境下启动Activity,设置下面的标签
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Log.d(TAG, " Build.VERSION SDK_INT= " + Build.VERSION.SDK_INT + " activity.getPackageName() " + activity.getPackageName());
            if (Build.VERSION.SDK_INT >= 24) { //判读版本是否在7.0以上
                //参数1 上下文, 参数2 Provider主机地址 和配置文件中保持一致   参数3  共享的文件
                Uri apkUri =
                        FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", file);
                //添加这一句表示对目标应用临时授权该Uri所代表的文件
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                intent.setDataAndType(apkUri, "application/vnd.android.package-archive");

            } else {
                intent.setDataAndType(Uri.fromFile(file),
                        "application/vnd.android.package-archive");
            }
            callbackContext.success();
            Thread.sleep(500);
            cordova.getActivity().runOnUiThread(() -> {
                activity.startActivity(intent);
            });
        } catch (Exception e) {
            Log.d(TAG, "openApk error " + e.getMessage());
            callbackContext.error(e.getMessage());
        }

    }

    private void loadUrlIntoView(String path) {
        cordova.getActivity().runOnUiThread(() -> {
            webView.loadUrlIntoView(path, false);
            webView.clearHistory();
        });
    }

    private void openHcpPage(String path, CallbackContext callbackContext) {
        Log.d(TAG, "openHcpPage path=" + path);
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                if (TextUtils.isEmpty(path)) {
                    if (callbackContext != null)
                        callbackContext.error("路径不存在");
                    return;
                }
                preferences.edit().putString("loadIndexPagePath", path).apply();
                loadUrlIntoView(path);
                callbackContext.success();
            }
        });
    }

    private String getVersion() {
        PackageManager packageManager = this.cordova.getActivity().getPackageManager();
        try {
            return packageManager.getPackageInfo(this.cordova.getActivity().getPackageName(), 0).versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    private String getFileAsString(File file) {
        StringBuilder sb = new StringBuilder();
        try {
            FileReader fr = new FileReader(file);
            BufferedReader bfr = new BufferedReader(fr);
            String line;
            while ((line = bfr.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } catch (FileNotFoundException e) {
            Log.d(TAG, e.getMessage());
        } catch (IOException e) {
            Log.d(TAG, e.getMessage());
        }
        return null;
    }

    private void getHash(String path, CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            CordovaResourceApi resourceApi = webView.getResourceApi();
            File file = resourceApi.mapUriToFile(getUriForArg(path));
            MD5 md5 = MD5.getInstance();
            try {
                String hash = md5.getHash(file.getAbsolutePath());
                Log.d(TAG, "hash = " + hash + " path =" + path);
                callbackContext.success(hash);
            } catch (IOException e) {
                callbackContext.error(e.getMessage());
                e.printStackTrace();
            }
        });
    }

    private void checkPathOrFileExists(String path, CallbackContext callbackContext) {
        cordova.getThreadPool().execute(() -> {
            try {
                if (TextUtils.isEmpty(path)) {
                    callbackContext.error("文件路径不能空");
                    return;
                }
                CordovaResourceApi resourceApi = webView.getResourceApi();
                File file = resourceApi.mapUriToFile(getUriForArg(path));
                if (!file.exists()) {
                    Log.d(TAG, "checkPathOrFileExists 文件不存在 path= " + file.getAbsolutePath());
                    callbackContext.error("文件不存在");
                    return;
                }
                Log.d(TAG, "checkPathOrFileExists 存在 path= " + file.getAbsolutePath());
                callbackContext.success();
            } catch (Exception e) {
                Log.d(TAG, "checkPathOrFileExists error " + e.getMessage());
                callbackContext.error(e.getMessage());
            }
        });
    }

    private Uri getUriForArg(String arg) {
        CordovaResourceApi resourceApi = webView.getResourceApi();
        Uri tmpTarget = Uri.parse(arg);
        return resourceApi.remapUri(
                tmpTarget.getScheme() != null ? tmpTarget : Uri.fromFile(new File(arg)));
    }

    private void copyAssets(String fromDir, String destRootDir, AssetManager manager) throws IOException {
        String[] fs = manager.list(fromDir);
        if (fs != null) {
            if (fs.length > 0) {
//                Log.d(TAG, "目录" + fromDir + " 文件数量" + fs.length);
                for (String s : fs) {
                    String tgt = destRootDir + File.separator + s;
//                    Log.d(HCPHelper.TAG, "原目录：" + fromDir + File.separator + s + "=>目的目录：" + tgt);
                    copyAssets(fromDir + File.separator + s, tgt, manager);
                }
            } else {
                copyAssetFile(fromDir, destRootDir, manager);
            }
        }
    }

    private void copyAssetFile(String fileName, String toFilePath, AssetManager manager) throws IOException {
        File file = new File(toFilePath);
        boolean d = deleteFile(file);
        Log.d(TAG, "删除file ok? " + d + " file exists " + file.exists());
        File toFile = new File(file.getParentFile(), file.getName());
        ensureDirectoryExists(toFile.getParentFile());
        boolean b = toFile.createNewFile();
        Log.d(TAG, toFile.getName() + " 创建是否成功？" + b + " toFile 是否存在 " + toFile.exists());
        InputStream in = new BufferedInputStream(manager.open(fileName));
        OutputStream out = new BufferedOutputStream(new FileOutputStream(toFile, false));
        // Transfer bytes from in to out
        byte[] buf = new byte[1024];
        int len;
        while ((len = in.read(buf)) > 0) {
            out.write(buf, 0, len);
        }
        out.flush();
        in.close();
        out.close();
    }

    public String readAssetFile(String assetFile, AssetManager am) throws IOException {
        StringBuilder sb = new StringBuilder();
        final InputStreamReader streamReader = new InputStreamReader(am.open(assetFile));
        final BufferedReader bufferedReader = new BufferedReader(streamReader);

        final char data[] = new char[1024];
        int count;
        while ((count = bufferedReader.read(data)) != -1) {
            sb.append(data, 0, count);
        }
        bufferedReader.close();
        return sb.toString();
    }

    /**
     * Delete file object.
     * If it is a folder - it will be deleted recursively will all content.
     *
     * @param fileOrDirectory file/directory to delete
     */
    public boolean deleteFile(File fileOrDirectory) {
        if (!fileOrDirectory.exists()) {
            return true;
        }

        if (fileOrDirectory.isDirectory()) {
            File[] filesList = fileOrDirectory.listFiles();
            for (File child : filesList) {
                deleteFile(child);
            }
        }

        final File to = new File(fileOrDirectory.getAbsolutePath() + System.currentTimeMillis());
        fileOrDirectory.renameTo(to);
        return to.delete();

        //fileOrDirectory.delete();
    }

    public boolean ensureFileExists(String file) throws IOException {
        File tgt = new File(file);
        ensureDirectoryExists(tgt.getParentFile());
        if (!tgt.exists() || tgt.isDirectory()) {
            return tgt.createNewFile();
        }
        return false;
    }

    public void ensureDirectoryExists(File tgt) {
        if (!tgt.exists() || !tgt.isDirectory()) {
            tgt.mkdirs();
        }
    }
}
