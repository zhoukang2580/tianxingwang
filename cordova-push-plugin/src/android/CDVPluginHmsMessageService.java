package com.beeant.push;

import android.content.Intent;
import android.text.TextUtils;
import android.util.Log;

import com.huawei.hms.push.HmsMessageService;
import com.huawei.hms.push.RemoteMessage;

import org.apache.cordova.PluginResult;
import org.json.JSONException;
import org.json.JSONObject;

public class CDVPluginHmsMessageService extends HmsMessageService {
    private static final String TAG = "PushDemoLog";

    /**
     * 申请Token如果当次调用失败，Push会自动重试申请，成功后则以onNewToken方法返回。
     * 华为设备上EMUI版本低于10.0申请Token时，以onNewToken方式返回。
     * 如果您集成的Push SDK版本为5.0.4.302及以上，建议您使用此方法获取Token。
     *
     * @param token 返回的token
     */
    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.i(TAG, "receive token:" + token);
        sendTokenToDisplay(token);
        if (PushPlugin.sMTokenCallback != null) {
            PushPlugin.sMTokenCallback.success(token);
        }
    }

    @Override
    public void onTokenError(Exception e) {
        super.onTokenError(e);
        String emsg = e != null ? e.getMessage() : "";
        if (TextUtils.isEmpty(emsg)) {
            emsg = "onTokenError";
        }
        Log.e(TAG, emsg);
        if (PushPlugin.sMTokenCallback != null) {
            PushPlugin.sMTokenCallback.error(emsg);
        }
    }

    /**
     * 无论应用在前台或者后台，当您在DemoHmsMessageService类中重写如下onMessageReceived方法后，只要您发送透传消息，都会获得透传消息的内容。
     * @param remoteMessage 透传消息
     */
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        JSONObject jsonObject = new JSONObject();
        if (remoteMessage == null) {
            Log.e(TAG, "Received message entity is null!");
            sendMessage(jsonObject, true);
            return;
        }
        if (remoteMessage.getData().length() > 0) {
            Log.i(TAG, "Message data payload: " + remoteMessage.getData());
        }
        if (remoteMessage.getNotification() != null) {
            Log.i(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }
        try {
            jsonObject.put("getData", remoteMessage.getData());
            jsonObject.put("getFrom", remoteMessage.getFrom());
            jsonObject.put("getTo", remoteMessage.getTo());
//           透传消息通过onMessageReceived回调后getMessageId获取到的msgId为“0”。
            jsonObject.put("getMessageId", remoteMessage.getMessageId());
            jsonObject.put("getSendTime", remoteMessage.getSentTime());
            jsonObject.put("getDataMap", remoteMessage.getDataOfMap());
            jsonObject.put("getMessageType", remoteMessage.getMessageType());
            jsonObject.put("getTtl", remoteMessage.getTtl());
            jsonObject.put("getToken", remoteMessage.getToken());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        sendMessage(jsonObject, true);
    }

    @Override
    public void onMessageSent(String s) {
    }

    @Override
    public void onSendError(String s, Exception e) {
    }

    private void sendTokenToDisplay(String token) {
        Intent intent = new Intent("com.beeant.push.ON_NEW_TOKEN");
        intent.putExtra("token", token);
        sendBroadcast(intent);
    }

    /**
     * Create a new plugin result and send it back to JavaScript
     *
     * @param info the network info to set as navigator.connection
     */
    private void sendMessage(JSONObject info, boolean keepCallback) {
        if (PushPlugin.sMMessageCallbackContext != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, info);
            result.setKeepCallback(keepCallback);
            PushPlugin.sMMessageCallbackContext.sendPluginResult(result);
        }
    }

}
