package com.beeant.plugin.hcp;

import android.content.SharedPreferences;
import android.content.res.AssetManager;
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

public class Hcp extends CordovaPlugin {
    private final String TAG = "HCP";
    private static final String FILE_PREFIX = "file://";
    private static final String LOCAL_ASSETS_FOLDER = "file:///android_asset/www";
    SharedPreferences preferences;
    CallbackContext mMallbackContext;
    private boolean isReload =false;
    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        preferences = cordova.getActivity().getPreferences(0);
        String path = this.preferences.getString("loadIndexPagePath", null);
        Log.d("Hcp", "热更插件加载页面 " + path);
        if (path != null) {
            isReload =true;
            openHcpPage(path, mMallbackContext);
        }
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);

    }

    @Override
    public void onStart() {
        super.onStart();
        String path = this.preferences.getString("loadIndexPagePath", null);
        Log.d("Hcp", "热更插件加载页面 " + path);
        if (path != null&&!this.isReload) {
            openHcpPage(path, mMallbackContext);
        }
    }

    @Override
    public void onPause(boolean multitasking) {
        super.onPause(multitasking);
        this.isReload =false;
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (TextUtils.equals("openHcpPage", action)) {
            mMallbackContext = callbackContext;
            this.openHcpPage(args.optString(0), callbackContext);
            return true;
        }
        if (TextUtils.equals("saveHcpPath", action)) {
            if(TextUtils.isEmpty(args.optString(0))){
                callbackContext.error("路径不存在");
                return true;
            }
            this.saveHcpPath(args.optString(0),callbackContext);
            return true;
        }
        if (TextUtils.equals("getHash", action)) {
            mMallbackContext = callbackContext;
            cordova.getThreadPool().execute(() -> {
                this.getHash(args.optString(0), callbackContext);
            });
            return true;
        }
        return super.execute(action, args, callbackContext);
    }

    private  void saveHcpPath(String path, CallbackContext callbackContext){
        preferences.edit().putString("loadIndexPagePath",path).apply();
        callbackContext.success();
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
                preferences.edit().putString("loadIndexPagePath",path).apply();
                cordova.getActivity().runOnUiThread(() -> {
                    webView.loadUrlIntoView(path, false);
                });
            }
        });
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

        this.checkPathOrFileExists(path, callbackContext);
        CordovaResourceApi resourceApi = webView.getResourceApi();
        File file = resourceApi.mapUriToFile(getUriForArg(path));
        cordova.getThreadPool().execute(() -> {
            MD5 md5 = MD5.getInstance();
            try {
                String hash = md5.getHash(file.getAbsolutePath());
                callbackContext.success(hash);
            } catch (IOException e) {
                callbackContext.error(e.getMessage());
                e.printStackTrace();
            }
        });
    }

    private void checkPathOrFileExists(String path, CallbackContext callbackContext) {
        CordovaResourceApi resourceApi = webView.getResourceApi();
        File file = resourceApi.mapUriToFile(getUriForArg(path));
        if (TextUtils.isEmpty(path)) {
            callbackContext.error("路径不能为空");
            return;
        }
        if (!file.exists()) {
            Log.d(TAG, "文件不存在 path= " + file.getAbsolutePath());
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
