package com.beeant.plugin.hcp;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.v4.content.FileProvider;
import android.text.TextUtils;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.xmlpull.v1.XmlPullParser;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.RandomAccessFile;
import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
public class Hcp extends CordovaPlugin {
    public static final String TAG = "HCPHelper";
    private BroadcastReceiver downloadApkReceiver;
    private BroadcastReceiver installApkReceiver;
    private CallbackContext downloadApkCallbackContext;
    public static final String KEY_TOTAL = "total";
    public static String KEY_DOWNLOADED = "downloaded";
    static String NEW_APK_URL = "newApkUrl";
    public static final String ACTION_DOWNLOAD_APK = ".DOWNLOAD_APK_ACTION";
    public static String CUSTOM_ACTION;
    private String serverVersion;
    private String serverUrl;
    @Override
    public void onStop() {
        super.onStop();
        removeDownloadApkReceiver();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        removeDownloadApkReceiver();
        removeInstallApkReceiver();
    }

    private void removeDownloadApkReceiver() {
        try {
            if(this.downloadApkReceiver !=null){
                webView.getContext().unregisterReceiver(this.downloadApkReceiver);
                this.downloadApkReceiver = null;
            }
        } catch (Exception e) {
            Log.d(TAG, "Error unregistering apk downloadApkReceiver: " + e.getMessage(), e);
        }
    }


    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        CUSTOM_ACTION=cordova.getContext().getPackageName()+ Hcp.ACTION_DOWNLOAD_APK;
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
    }
    private  void checkUpdate(final String url, final CallbackContext callbackContext){
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    serverUrl = url;
                    String json=Utils.downloadJson(serverUrl);
                    JSONObject jsonObject = new JSONObject(json);
                    serverVersion=null;
                    if(jsonObject.has("version")){
                        serverVersion=jsonObject.optString("version");
                    }else{
                        callbackContext.error("服务器"+serverUrl+"上的chcp.json文件不正确，缺少键 version");
                        return;
                    }
                    String curVersion=Utils.getAppVersionName(cordova.getContext());
                    JSONObject obj = new JSONObject();
                    boolean hasUpdate=false;
                    if(!TextUtils.isEmpty(curVersion)&&!TextUtils.isEmpty(serverVersion)){
                        String[] sv=serverVersion.split("\\.");//[2,3,1]
                        String[] cv=curVersion.split("\\.");//[2,5,0]
                        for (int i=0;i<Math.min(sv.length,cv.length);i++){
                            int v=Integer.parseInt(sv[i]);
                            int c=Integer.parseInt(cv[i]);
                            if(v>c){
                                hasUpdate=true;
                                break;
                            }else if(v<c){
                                hasUpdate=false;
                                break;
                            }
                        }
                    }
                    obj.put("checkResult",hasUpdate);// 不等说明有更新
                    obj.put("updateDesc",jsonObject.optString("updateDesc"));
                    obj.put("currentVersion",curVersion);
                    obj.put("serverVersion",serverVersion);
                    callbackContext.success(obj);
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(e.getMessage());
                }
            }
        });
    }
    @Override
    public void onStart() {
        super.onStart();
    }

    /**
     * 更新www资源
     * @param callbackContext
     */
    private void  checkIsUpdateWww(String serverVersion, CallbackContext callbackContext){
       String curVersion= Utils.getAppVersionName(cordova.getContext());
       if(TextUtils.isEmpty(serverVersion)){
           callbackContext.error("服务器版本不能为空");
           return;
        }
       if(!serverVersion.contains(".")){
           callbackContext.error("版本号格式不对");
           return ;
       }
       String m0 = curVersion.split(".")[0];
       String m1 = serverVersion.split(".")[0];
       if(TextUtils.equals(m0,m1)){
           callbackContext.success("true");
       }else {
           callbackContext.success("false");
       }
    }



    private void downloadApk(String url,CallbackContext callbackContext) {
        if (downloadApkCallbackContext == null) {
            downloadApkCallbackContext = callbackContext;
        }
        try {
            if(null==serverVersion){
                if(null==serverUrl){
                    callbackContext.error("服务器地址不正确");
                    return;
                }
                String json=Utils.downloadJson(serverUrl);
                JSONObject jsonObject = new JSONObject(json);
                if(jsonObject.has("version")){
                    serverVersion=jsonObject.optString("version");
                }else{
                    callbackContext.error("服务器"+serverUrl+"上的chcp.json文件不正确，缺少键 version");
                    return;
                }
            }
            if(null==serverVersion){
                callbackContext.error("服务器"+serverUrl+"上的chcp.json文件不存在或者格式不正确");
                return;
            }
            File newApk = new File(Build.VERSION.SDK_INT>=24?cordova.getContext().getCacheDir():cordova.getContext().getExternalCacheDir(),
                    "download"+File.separator+serverVersion.replaceAll("\\.","_")+".apk");
            if(newApk.exists()){
                String curVersion=Utils.getAppVersionName(cordova.getContext());
                boolean hasUpdate=false;
                if(!TextUtils.isEmpty(curVersion)&&!TextUtils.isEmpty(serverVersion)){
                    String[] sv=serverVersion.split("\\.");
                    String[] cv=curVersion.split("\\.");
                    for (int i=0;i<Math.min(sv.length,cv.length);i++){
                        int v=Integer.parseInt(sv[i]);
                        int c=Integer.parseInt(cv[i]);
                        if(v>c){
                            hasUpdate=true;
                            break;
                        }
                    }
                }
                if(hasUpdate){
                    if(this.downloadApkCallbackContext==null){
                        this.downloadApkCallbackContext=callbackContext;
                    }
                    downloadApkComplete(newApk.getAbsolutePath());
                    return ;
                }
            }
            Utils.downloadApkWithProgress(url,newApk.getAbsolutePath(),cordova
                    .getContext());
            if(newApk.exists()){
                downloadApkComplete(newApk.getAbsolutePath());
            }else{
                throw new Exception("下载Apk失败,文件不存在或缓存不足已被删除");
            }
        } catch (Exception e) {
            e.printStackTrace();
            callbackContext.error(e.getMessage());
            Log.d(TAG,"下载apk失败，"+e.getMessage());
        }
    }

    private void updateDownloadStatus(Intent downloadInfo) {
        sendUpdate(getStatus(downloadInfo), true);
    }

    private JSONObject getStatus(Intent intent) {
        JSONObject obj = new JSONObject();
        try {
            obj.put(KEY_TOTAL, intent.getIntExtra(KEY_TOTAL, 0));
            obj.put(KEY_DOWNLOADED, intent.getIntExtra(KEY_DOWNLOADED, 0));
        } catch (JSONException e) {
            Log.d(TAG, e.getMessage(), e);
        }
        return obj;
    }

    private void sendUpdate(JSONObject status, boolean keepCallback) {
        if (this.downloadApkCallbackContext != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, status);
            result.setKeepCallback(keepCallback);
            this.downloadApkCallbackContext.sendPluginResult(result);
        }
    }


    private void removeInstallApkReceiver(){
        if(installApkReceiver!=null){
            cordova.getContext().unregisterReceiver(installApkReceiver);
            installApkReceiver=null;
        }
    }
    @Override
    public boolean execute(String action, final JSONArray rawArgs, final CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, action + " 执行"+" 第0个参数："+rawArgs.optString(0));
        if ("downloadApk".equalsIgnoreCase(action)) {
            if (this.downloadApkCallbackContext != null) {
                removeDownloadApkReceiver();
            }
            downloadApkCallbackContext = callbackContext;
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(CUSTOM_ACTION);
            if (this.downloadApkReceiver == null) {
                downloadApkReceiver = new BroadcastReceiver() {
                    @Override
                    public void onReceive(Context context, Intent intent) {
                        updateDownloadStatus(intent);
                    }
                };
                webView.getContext().registerReceiver(downloadApkReceiver, intentFilter);
            }
            PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);
            cordova.getThreadPool().execute(new Runnable() {
                @Override
                public void run() {
                    String newApkUrl = rawArgs.optString(0);
                    downloadApk(newApkUrl,callbackContext);
                }
            });
            return true;
        }
        if("openAPK".equalsIgnoreCase(action)){
            Log.d(TAG,"打开新版本的路径："+rawArgs.optString(0)+
                    " 文件是否存在？"+new File(rawArgs.optString(0)).exists());
            Utils.openAPK(rawArgs.optString(0),cordova.getActivity());
            return true;
        }
        if (TextUtils.equals(action, "getAppVersion")) {
            try {
                callbackContext.success(Utils.getAppVersionName(cordova.getContext()));
            } catch (Exception e) {
                callbackContext.error(e.getMessage());
            }
            return true;
        }
        if (TextUtils.equals(action, "checkUpdate")) {
            try {
                checkUpdate(rawArgs.optString(0),callbackContext);
            } catch (Exception e) {
                callbackContext.error(e.getMessage());
            }
            return true;
        }
        return super.execute(action, rawArgs, callbackContext);
    }
    private void downloadApkComplete(String fileUrl) {
        try {
            JSONObject obj = new JSONObject();
//           obj.put(KEY_TOTAL, intent.getIntExtra(KEY_TOTAL, 0));
            obj.put(KEY_DOWNLOADED, 100);
            obj.put(NEW_APK_URL,fileUrl);
            this.sendUpdate(obj, false); // release status callback in JS side
            removeDownloadApkReceiver();
            if(downloadApkCallbackContext!=null){
                downloadApkCallbackContext.success(fileUrl);
                this.downloadApkCallbackContext = null;
            }
        } catch (JSONException e) {
            e.printStackTrace();
            if(downloadApkCallbackContext!=null){
                downloadApkCallbackContext.error(e.getMessage());
            }
        }
    }


    @Override
    public boolean onOverrideUrlLoading(String url) {
        return super.onOverrideUrlLoading(url);
    }
}



class Utils {
    /**
     * 单线程下载文件
     *
     * @param url  文件的网络地址
     * @param path 保存的文件地址
     */
    @SuppressWarnings("ResultOfMethodCallIgnored")
    public static void downloadApkWithProgress(String url, String path, Context context) throws Exception {
        Log.d(Hcp.TAG, "下载中...");
        InputStream inputStream = null;
        RandomAccessFile randomAccessFile = null;
        File file = new File(path);
        try {
            HttpURLConnection urlConnection = (HttpURLConnection) new URL(url).openConnection();
            urlConnection.setRequestMethod("GET");
            urlConnection.setConnectTimeout(10 * 1000);
            if (!file.getParentFile().exists()) {
                file.getParentFile().mkdir();
            }
            if (file.exists()) {
                file.delete();
            }
            file.createNewFile();
            int responseCode = urlConnection.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                inputStream = urlConnection.getInputStream();
                int len;
                byte[] data = new byte[4096];
                int progres = 0; //用于保存当前进度（具体进度）
                int maxProgres = urlConnection.getContentLength();//获取文件
                randomAccessFile = new RandomAccessFile(file, "rwd");
                randomAccessFile.setLength(maxProgres);//设置文件大小
                int unit = maxProgres / 100;//将文件大小分成100分，每一分的大小为unit
                int unitProgress = 0; //用于保存当前进度(1~100%)
                while (-1 != (len = inputStream.read(data))) {
                    randomAccessFile.write(data, 0, len);
                    progres += len;//保存当前具体进度
                    int temp = progres / unit; //计算当前百分比进度
                    if (temp >= 1 && temp > unitProgress) {//如果下载过程出现百分比变化
                        unitProgress = temp;//保存当前百分比
                        Log.d(Hcp.TAG, "正在下载中..." + unitProgress + "%");
                        Intent intent = new Intent(Hcp.CUSTOM_ACTION);
                        intent.putExtra(Hcp.KEY_TOTAL, maxProgres);
                        intent.putExtra(Hcp.KEY_DOWNLOADED, unitProgress);
                        context.sendBroadcast(intent);
                    }
                }
                inputStream.close();
                Log.d(Hcp.TAG, "下载完成...");
            } else {
                throw new Exception("服务器异常...");
            }
        } catch (Exception e) {
            if(file.exists()){
                Log.d(Hcp.TAG,"下载出错,文件已删除");
                Utils.deleteFile(file);
            }
            Log.d(Hcp.TAG,"下载异常"+e.getMessage());
            throw e;
        } finally {
            if (null != inputStream) {
                inputStream.close();
            }
            if (null != randomAccessFile) {
                randomAccessFile.close();
            }

        }
    }

    public static void openAPK(String fileSavePath, Activity activity) {
        File file = new File(fileSavePath);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        // 由于没有在Activity环境下启动Activity,设置下面的标签
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        Log.d(Hcp.TAG,"Build.VERSION SDK_INT="+Build.VERSION.SDK_INT);
        if(Build.VERSION.SDK_INT>=24) { //判读版本是否在7.0以上
            //参数1 上下文, 参数2 Provider主机地址 和配置文件中保持一致   参数3  共享的文件
            Uri apkUri =
                    FileProvider.getUriForFile(activity, activity.getPackageName()+".fileprovider", file);
            //添加这一句表示对目标应用临时授权该Uri所代表的文件
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.setDataAndType(apkUri, "application/vnd.android.package-archive");

        }else{
            intent.setDataAndType(Uri.fromFile(file),
                    "application/vnd.android.package-archive");
        }
        activity.startActivity(intent);
    }

    public static String getAppVersionName(Context context) {
        String versionName = "";
        try {
            // ---get the package info---
            PackageManager pm = context.getPackageManager();
            PackageInfo pi = pm.getPackageInfo(context.getPackageName(), 0);
            versionName = pi.versionName;
            int versioncode = pi.versionCode;
            if (versionName == null || versionName.length() <= 0) {
                return "";
            }
        } catch (Exception e) {
            Log.e("VersionInfo", "Exception", e);
        }
        return versionName;
    }

    static void copyAssets(String fromDir, String destRootDir, AssetManager manager) throws IOException {
        String[] fs = manager.list(fromDir);
        if (fs != null) {
            if (fs.length > 0) {
//                Log.d(HCPHelper.TAG, "目录" + fromDir + " 文件数量" + fs.length);
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

    static void writeContent2File(String cnt, String toFile, boolean append) throws IOException {
        FileWriter fw = new FileWriter(toFile, append);
        fw.write(cnt);
        fw.flush();
        fw.close();
    }

    private static void copyAssetFile(String fileName, String toFilePath, AssetManager manager) throws IOException {
        File file = new File(toFilePath);
        boolean d = Utils.deleteFile(file);
        Log.d(Hcp.TAG, "删除file ok? " + d + " file exists " + file.exists());
        File toFile = new File(file.getParentFile(), file.getName());
        ensureDirectoryExists(toFile.getParentFile());
        boolean b = toFile.createNewFile();
        Log.d(Hcp.TAG, toFile.getName() + " 创建是否成功？" + b + " toFile 是否存在 " + toFile.exists());
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

    static List<ManifestFile> getManifestFilesFromJsonString(String str) throws JSONException {
        JSONArray localMenifest = new JSONArray(str);
        List<ManifestFile> manifestFileList = new ArrayList<>();
        for (int i = 0; i < localMenifest.length(); i++) {
            JSONObject obj = (JSONObject) localMenifest.get(i);
            ManifestFile manifestFile = new ManifestFile();
            manifestFile.setFile(obj.getString(ManifestFile.FILE_NAME_PRO));
            manifestFile.setHash(obj.getString(ManifestFile.FILE_HASH_PRO));
            manifestFileList.add(manifestFile);
        }
        return manifestFileList;
    }

    public static String readAssetFile(String assetFile, AssetManager am) throws IOException {
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
     * Download file from server, save it on the disk and check his hash.
     *
     * @param urlFrom  url to download from
     * @param filePath where to save file
     * @param checkSum checksum of the file
     * @throws IOException
     */
    public static void download(final String urlFrom, final String filePath, final String checkSum, final Map<String,
            String> requestHeaders) throws Exception {
        Log.d(Hcp.TAG, "开始下载文件: " + urlFrom);
        final MD5 md5 = new MD5();
        File f = new File(filePath);
        if (f.exists()) {
            Log.d(Hcp.TAG, "先删除本地旧文件 " + f.getAbsolutePath());
            deleteFile(f);
        }
        // download file
        final URLConnection connection = new URL(urlFrom).openConnection();
        if (requestHeaders != null && requestHeaders.size() > 0) {
            for (Map.Entry<String, String> entry : requestHeaders.entrySet()) {
                connection.addRequestProperty(entry.getKey(), entry.getValue());
            }
        }
        connection.setDoInput(true);
        final InputStream input = new BufferedInputStream(connection.getInputStream());
        final OutputStream output = new BufferedOutputStream(new FileOutputStream(filePath, false));

        final byte data[] = new byte[1024];
        int count;
        while ((count = input.read(data)) != -1) {
            output.write(data, 0, count);
            md5.write(data, count);
        }
        output.flush();
        output.close();
        input.close();
        String fileName = urlFrom.substring(urlFrom.lastIndexOf("/") + 1);
        final String downloadedFileHash = md5.calculateHash();
        Log.d(Hcp.TAG, "文件下载完成！ " + fileName + " downloadedFileHash=" + downloadedFileHash + ";checkSum= " +
                checkSum);
        if (!downloadedFileHash.equals(checkSum)) {
            throw new IOException("文件不完整:" + fileName + "; downloadedFileHash:" + downloadedFileHash + "; checkSum" +
                    checkSum);
        }
    }

    /**
     * Read data as string from the provided file.
     *
     * @param filePath absolute path to the file
     * @return data from file
     * @throws IOException
     */
    public static String readFromFile(String filePath) throws IOException {
        return readFromFile(new File(filePath));
    }

    /**
     * Read data as string from the provided file.
     *
     * @param file file to read from
     * @return data from file
     * @throws IOException
     */
    public static String readFromFile(File file) throws IOException {
        BufferedReader bufferedReader = new BufferedReader(new FileReader(file));

        StringBuilder content = new StringBuilder();
        String line;
        while ((line = bufferedReader.readLine()) != null) {
            content.append(line).append("\n");
        }

        bufferedReader.close();

        return content.toString().trim();
    }

    static String downloadJson(String jsonFileUrl) throws Exception {
        final StringBuilder jsonContent = new StringBuilder();
        final URLConnection urlConnection = new URL(jsonFileUrl).openConnection();
        final InputStreamReader streamReader = new InputStreamReader(urlConnection.getInputStream());
        final BufferedReader bufferedReader = new BufferedReader(streamReader);

        final char data[] = new char[1024];
        int count;
        while ((count = bufferedReader.read(data)) != -1) {
            jsonContent.append(data, 0, count);
        }
        bufferedReader.close();

        return jsonContent.toString();
    }

    /**
     * Copy object from one place to another.
     * Can be used to copy file to file, or folder to folder.
     *
     * @param src absolute path to source object
     * @param dst absolute path to destination object
     * @throws IOException
     */
    public static void copy(String src, String dst) throws IOException {
        copy(new File(src), new File(dst));
    }

    /**
     * Copy file object from one place to another.
     * Can be used to copy file to file, or folder to folder.
     *
     * @param src source file
     * @param dst destination file
     * @throws IOException
     */
    public static void copy(File src, File dst) throws IOException {
        Log.d(Hcp.TAG, "复制文件" + src.getAbsolutePath() + "=>" + dst.getAbsolutePath());
        if (src.isDirectory()) {
            ensureDirectoryExists(dst);

            String[] filesList = src.list();
            for (String file : filesList) {
                File srcFile = new File(src, file);
                File destFile = new File(dst, file);

                copy(srcFile, destFile);
            }
        } else {
            copyFile(src, dst);
        }
    }

    private static void copyFile(File fromFile, File toFile) throws IOException {
        InputStream in = new BufferedInputStream(new FileInputStream(fromFile));
        OutputStream out = new BufferedOutputStream(new FileOutputStream(toFile));

        // Transfer bytes from in to out
        byte[] buf = new byte[8192];
        int len;
        while ((len = in.read(buf)) > 0) {
            out.write(buf, 0, len);
        }

        in.close();
        out.close();
    }

    public static void ensureDirectoryExists(File tgt) {
        if (!tgt.exists() || !tgt.isDirectory()) {
            tgt.mkdirs();
        }
    }

    public static boolean ensureFileExists(String file) throws IOException {
        File tgt = new File(file);
        ensureDirectoryExists(tgt.getParentFile());
        if (!tgt.exists() || tgt.isDirectory()) {
            return tgt.createNewFile();
        }
        return false;
    }

    /**
     * Calculate MD5 hash of the file
     *
     * @param file file whose hash we need
     * @return calculated hash
     * @throws Exception
     * @see MD5
     */
    public static String calculateFileHash(File file) throws Exception {
        MD5 md5 = new MD5();
        InputStream in = new BufferedInputStream(new FileInputStream(file));
        int len;
        byte[] buff = new byte[8192];
        while ((len = in.read(buff)) > 0) {
            md5.write(buff, len);
        }
        return md5.calculateHash();
    }

    /**
     * Delete file object.
     * If it is a folder - it will be deleted recursively will all content.
     *
     * @param fileOrDirectory file/directory to delete
     */
    public static boolean deleteFile(File fileOrDirectory) {
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
}

class MD5 {

    private MessageDigest digest;

    /**
     * Class constructor.
     */
    MD5() {
        try {
            digest = MessageDigest.getInstance("MD5");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }

    /**
     * Write bytes, based on which we will calculate hash later on.
     *
     * @param bytes  bytes
     * @param length number of bytes to take
     */
    void write(byte[] bytes, int length) {
        if (digest == null) {
            return;
        }
        digest.update(bytes, 0, length);
    }

    /**
     * Calculate hash based on the received bytes.
     *
     * @return md5 hash string
     */
    String calculateHash() {
        if (digest == null) {
            return "";
        }

        byte[] md5sum = digest.digest();
        BigInteger bigInt = new BigInteger(1, md5sum);
        String output = bigInt.toString(16);

        // Fill to 32 chars
        return String.format("%32s", output).replace(' ', '0');
    }
}

class ChcpConfigTag {
    public static final String chcp = "chcp";
    public static final String minNativeInterface = "min-native-interface";
    public static final String minNativeInterface_attr = "value";
}

class ChcpConfig {
    public String version;// 版本，采用时间戳，1544239325450 越往后，越新，仅保留最近几个版本
    public String contentUrl;
    public int minNativeInterface;
    public String downloadNewVersionApkUrl;

    public void setDownloadNewVersionApkUrl(String downloadNewVersionApkUrl) {
        this.downloadNewVersionApkUrl = downloadNewVersionApkUrl;
    }

    public String getDownloadNewVersionApkUrl() {
        return downloadNewVersionApkUrl;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getContentUrl() {
        if (contentUrl != null && contentUrl.endsWith("/")) {
            contentUrl = contentUrl.substring(0, contentUrl.lastIndexOf("/"));
        }
        return contentUrl;
    }

    public void setContentUrl(String contentUrl) {
        this.contentUrl = contentUrl;
    }


    public int getMinNativeInterface() {
        return minNativeInterface;
    }

    public void setMinNativeInterface(int minNativeInterface) {
        this.minNativeInterface = minNativeInterface;
    }


}

class ChcpXmlParser extends ConfigXmlParser {
    ChcpConfig chcpConfig;
    private boolean isInsideChcpBlock;
    private boolean didParseChcpBlock;

    public ChcpXmlParser(ChcpConfig chcpConfig) {
        this.chcpConfig = chcpConfig;
    }


    public ChcpConfig getChcpConfig() {
        return chcpConfig;
    }

    @Override
    public void handleEndTag(XmlPullParser xml) {
        if (didParseChcpBlock) {
            return;
        }
        final String name = xml.getName();
        if (ChcpConfigTag.chcp.equals(name)) {
            didParseChcpBlock = true;
            isInsideChcpBlock = false;
        }
    }

    @Override
    public void handleStartTag(XmlPullParser xml) {
        super.handleStartTag(xml);
        if (didParseChcpBlock) {
            return;
        }
        if (ChcpConfigTag.chcp.equals(xml.getName())) {
            isInsideChcpBlock = true;
            return;
        }
        // proceed only if we are parsing our plugin preferences
        if (!isInsideChcpBlock) {
            return;
        }
        if (ChcpConfigTag.minNativeInterface.equals(xml.getName())) {
            String mni = xml.getAttributeValue(null, ChcpConfigTag.minNativeInterface_attr);
            Log.d(Hcp.TAG, "解析标签" + ChcpConfigTag.minNativeInterface + " value=" + mni);
            this.chcpConfig.setMinNativeInterface(Integer.parseInt(mni));
        }
    }
}

class ManifestFile {
    public static final String FILE_NAME_PRO = "file";
    public static final String FILE_HASH_PRO = "hash";
    public String file;
    public String hash;

    public String getFile() {
        return file;
    }

    public void setFile(String file) {
        this.file = file;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null) {
            return false;
        }
        if (!(o instanceof ManifestFile)) {
            return super.equals(o);
        }
        ManifestFile comparedFile = (ManifestFile) o;
        return comparedFile.file.equals(file) && comparedFile.hash.equals(hash);
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }

    @NonNull
    @Override
    public String toString() {
        return "file=" + file + "\n hash=" + hash + "\n";
    }
}
