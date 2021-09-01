package com.beeant.push;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Looper;
import android.text.TextUtils;
import android.util.Log;

import com.xiaomi.mipush.sdk.ErrorCode;
import com.xiaomi.mipush.sdk.MiPushClient;
import com.xiaomi.mipush.sdk.MiPushCommandMessage;
import com.xiaomi.mipush.sdk.MiPushMessage;
import com.xiaomi.mipush.sdk.PushMessageReceiver;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;

public class MyMiMessageReceiver extends PushMessageReceiver {
    private String mRegId;
    private long mResultCode = -1;
    private String mReason;
    private String mCommand;
    private String mMessage;
    private String mTopic;
    private String mAlias;
    private String mUserAccount;
    private String mStartTime;
    private String mEndTime;
    private boolean isSendRegId = false;

    @Override
    public void onReceivePassThroughMessage(Context context, MiPushMessage message) {
        Log.d(PushPlugin.TAG, "onReceivePassThroughMessage");
        mMessage = message.getContent();
        if (!TextUtils.isEmpty(message.getTopic())) {
            mTopic = message.getTopic();
        } else if (!TextUtils.isEmpty(message.getAlias())) {
            mAlias = message.getAlias();
        } else if (!TextUtils.isEmpty(message.getUserAccount())) {
            mUserAccount = message.getUserAccount();
        }
        sendMiPushMessage(message);
    }

    private void sendMiPushMessage(MiPushMessage message) {
        try {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("getAlias", message.getAlias());
            jsonObject.put("getCategory", message.getCategory());
            jsonObject.put("getContent", message.getContent());
            jsonObject.put("getMessageId", message.getMessageId());
            jsonObject.put("getMessageType", message.getMessageType());
            jsonObject.put("getNotifyId", message.getNotifyId());
            jsonObject.put("getPassThrough", message.getPassThrough());
            jsonObject.put("getTitle", message.getTitle());
            jsonObject.put("getTopic", message.getTopic());
            jsonObject.put("getUserAccount", message.getUserAccount());
            Map<String, String> extra = message.getExtra();
            if (extra != null && !extra.isEmpty()) {
                for (Map.Entry<String, String> item : extra.entrySet()) {
                    jsonObject.put(item.getKey(), item.getValue());
                }
            }
            sendMessage(jsonObject, true);
        } catch (JSONException e) {
            e.printStackTrace();
            if (!TextUtils.isEmpty(e.getMessage())) {
                Log.d(PushPlugin.TAG, e.getMessage());
            }
        }
    }

    private void setBadge(Context context, int badgeCount, String msgTitle, String msgCnt) {
        try {
//            new BadgeImpl(context).clearBadge();
//            Looper.prepare();
//            BadgeUtils.addBadger(context, badgeCount);
//            Looper.loop();
//            ShortcutBadger.applyNotification(context,BadgeUtils.getNotification(context,
//            badgeCount),badgeCount);
//            Notification notification=BadgeUtils.getNotification(context,badgeCount);
//            Field field = notification.getClass().getDeclaredField("extraNotification");
//            Object extraNotification = field.get(notification);
//            Method method = extraNotification.getClass().getDeclaredMethod("setMessageCount",
//            int.class);
//            method.invoke(extraNotification, badgeCount);
            Looper.prepare();
            new XiaomiBadgeHelper().setBadge(context, badgeCount);
            Looper.loop();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


//    private void tryNewMiuiBadge(Context context, int badgeCount) throws ShortcutBadgeException {
//        try {
//            Intent intent = new Intent(Intent.ACTION_MAIN);
//            intent.addCategory(Intent.CATEGORY_HOME);
//            ResolveInfo resolveInfo = context.getPackageManager().resolveActivity(intent,
//                    PackageManager.MATCH_DEFAULT_ONLY);
//            NotificationManager mNotificationManager = (NotificationManager) context
//                    .getSystemService(Context.NOTIFICATION_SERVICE);
//            Notification.Builder builder = new Notification.Builder(context)
//                    .setContentTitle("")
//                    .setContentText("")
//                    .setSmallIcon(resolveInfo.getIconResource());
//            Notification notification = builder.build();
//            Field field = notification.getClass().getDeclaredField("extraNotification");
//            Object extraNotification = field.get(notification);
//            Method method = extraNotification.getClass().getDeclaredMethod("setMessageCount",
//                    int.class);
//            method.invoke(extraNotification, badgeCount);
//            mNotificationManager.notify(0, notification);
//        } catch (Exception e) {
//            throw new ShortcutBadgeException("not able to set badge", e);
//        }
//    }

    private void sendMessage(JSONObject info, boolean keepCallback) {
        PushPlugin.sendMessage(info, keepCallback);
    }

    @Override
    public void onNotificationMessageClicked(Context context, MiPushMessage message) {
        Log.d(PushPlugin.TAG,
                "onNotificationMessageClicked PushPlugin.sMIsAppStarted " + PushPlugin.sMIsAppStarted);
        try {
            if (!PushPlugin.sMIsAppStarted) {
                Intent intent = new Intent();
                intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                intent.setAction(Intent.ACTION_MAIN);
                intent.addCategory(Intent.CATEGORY_LAUNCHER);
                intent.setClassName(context,context.getPackageName()+(".MainActivity"));
                Log.d(PushPlugin.TAG,"onNotificationMessageClicked "+context.getPackageName()+(".MainActivity"));
                Bundle bundle = new Bundle();
                bundle.putString("getUserAccount", message.getUserAccount());
                bundle.putString("getTopic", message.getTopic());
                bundle.putString("getTitle", message.getTitle());
                bundle.putInt("getPassThrough", message.getPassThrough());
                bundle.putInt("getNotifyId", message.getNotifyId());
                bundle.putString("getMessageId", message.getMessageId());
                bundle.putString("getContent", message.getContent());
                bundle.putString("getCategory", message.getCategory());
                bundle.putString("getAlias", message.getAlias());
                bundle.putString("getDescription", message.getDescription());
                bundle.putInt("getMessageType", message.getMessageType());
                bundle.putInt("getNotifyType", message.getNotifyType());
                Map<String, String> extra = message.getExtra();
                if (extra != null && !extra.isEmpty()) {
                    for (Map.Entry<String, String> item : extra.entrySet()) {
                        bundle.putString(item.getKey(), item.getValue());
                    }
                }
                intent.putExtras(bundle);
                context.startActivity(intent);
                PushPlugin.sMIsAppStarted = true;
            }
            mMessage = message.getContent();
            if (!TextUtils.isEmpty(message.getTopic())) {
                mTopic = message.getTopic();
            } else if (!TextUtils.isEmpty(message.getAlias())) {
                mAlias = message.getAlias();
            } else if (!TextUtils.isEmpty(message.getUserAccount())) {
                mUserAccount = message.getUserAccount();
            }
            sendMiPushMessage(message);
        } catch (Exception e) {
            e.printStackTrace();
            Log.e(PushPlugin.TAG, e.getMessage());
        }


    }

    @Override
    public void onNotificationMessageArrived(Context context, MiPushMessage message) {
        Log.d(PushPlugin.TAG, "onNotificationMessageArrived");
        mMessage = message.getContent();
        if (!TextUtils.isEmpty(message.getTopic())) {
            mTopic = message.getTopic();
        } else if (!TextUtils.isEmpty(message.getAlias())) {
            mAlias = message.getAlias();
        } else if (!TextUtils.isEmpty(message.getUserAccount())) {
            mUserAccount = message.getUserAccount();
        }
        if (message.getExtra() != null && message.getExtra().containsKey("badge")) {
            for (Map.Entry<String, String> item : message.getExtra().entrySet()) {
                if (!TextUtils.isEmpty(item.getKey()) && item.getKey().equalsIgnoreCase("badge")) {
                    try {
                        setBadge(context, Integer.parseInt(item.getValue()), message.getTitle(),
                                message.getContent());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    break;
                }
            }
        }
        sendMiPushMessage(message);
    }

    @Override
    public void onCommandResult(Context context, MiPushCommandMessage message) {
        String command = message.getCommand();
        List<String> arguments = message.getCommandArguments();
        String cmdArg1 = ((arguments != null && arguments.size() > 0) ? arguments.get(0) :
                null);
        String cmdArg2 = ((arguments != null && arguments.size() > 1) ? arguments.get(1) :
                null);
        if (MiPushClient.COMMAND_REGISTER.equals(command)) {
            if (message.getResultCode() == ErrorCode.SUCCESS) {
                mRegId = cmdArg1;
                sendRegId(mRegId, null);
            } else {
                sendRegId(null, message.getReason());
            }
        } else if (MiPushClient.COMMAND_SET_ALIAS.equals(command)) {
            if (message.getResultCode() == ErrorCode.SUCCESS) {
                mAlias = cmdArg1;
            }
        } else if (MiPushClient.COMMAND_UNSET_ALIAS.equals(command)) {
            if (message.getResultCode() == ErrorCode.SUCCESS) {
                mAlias = cmdArg1;
            }
        } else if (MiPushClient.COMMAND_SUBSCRIBE_TOPIC.equals(command)) {
            if (message.getResultCode() == ErrorCode.SUCCESS) {
                mTopic = cmdArg1;
            }
        } else if (MiPushClient.COMMAND_UNSUBSCRIBE_TOPIC.equals(command)) {
            if (message.getResultCode() == ErrorCode.SUCCESS) {
                mTopic = cmdArg1;
            }
        } else if (MiPushClient.COMMAND_SET_ACCEPT_TIME.equals(command)) {
            if (message.getResultCode() == ErrorCode.SUCCESS) {
                mStartTime = cmdArg1;
                mEndTime = cmdArg2;
            }
        }
    }

    private void sendRegId(String regId, String errMsg) {
        if (isSendRegId || PushPlugin.sMMiPushRegisterCallbackContext == null)
            return;
        isSendRegId = true;
        if (!TextUtils.isEmpty(errMsg)) {
            PushPlugin.sMMiPushRegisterCallbackContext.error(errMsg);
        } else {
            if (!TextUtils.isEmpty(regId)) {
                Log.d(PushPlugin.TAG, regId);
                PushPlugin.sMMiPushRegisterCallbackContext.success(mRegId);
            } else {
                PushPlugin.sMMiPushRegisterCallbackContext.error(errMsg);
            }
        }
    }

    @Override
    public void onReceiveRegisterResult(Context context, MiPushCommandMessage message) {
        String command = message.getCommand();
        List<String> arguments = message.getCommandArguments();
        String cmdArg1 = ((arguments != null && arguments.size() > 0) ? arguments.get(0) :
                null);
        String cmdArg2 = ((arguments != null && arguments.size() > 1) ? arguments.get(1) :
                null);
        if (MiPushClient.COMMAND_REGISTER.equals(command)) {
            if (message.getResultCode() == ErrorCode.SUCCESS) {
                mRegId = cmdArg1;
                sendRegId(mRegId, null);
            } else {
                sendRegId(null, message.getReason());
            }
        }

    }
}
