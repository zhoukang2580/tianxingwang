package com.beeant.push;


import android.content.Context;
import android.util.Log;

import com.vivo.push.model.UPSNotificationMessage;
import com.vivo.push.model.UnvarnishedMessage;
import com.vivo.push.sdk.OpenClientPushMessageReceiver;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class MyViVoPushMessageReceiverImpl extends OpenClientPushMessageReceiver {
    @Override
    public void onNotificationMessageClicked(Context context, UPSNotificationMessage msg) {
        super.onNotificationMessageClicked(context, msg);
        if(PushPlugin.sMMessageCallbackContext!=null){
            JSONObject jsonObject=new JSONObject();
            try {
                jsonObject.put("getAdClickCheckUrl",msg.getAdClickCheckUrl());
                jsonObject.put("getCompatibleType",msg.getCompatibleType());
                jsonObject.put("getContent",msg.getContent());
                jsonObject.put("getCoverUrl",msg.getCoverUrl());
                jsonObject.put("getIconUrl",msg.getIconUrl());
                jsonObject.put("getIsMacroReplace",msg.getIsMacroReplace());
                jsonObject.put("getMsgId",msg.getMsgId());
                jsonObject.put("getNotifyType",msg.getNotifyType());
                jsonObject.put("getPurePicUrl",msg.getPurePicUrl());
                jsonObject.put("getSkipContent",msg.getSkipContent());
                jsonObject.put("getTargetType",msg.getSkipType());
                jsonObject.put("",msg.getTargetType());
                jsonObject.put("getTitle",msg.getTitle());
                jsonObject.put("getTragetContent",msg.getTragetContent());
                jsonObject.put("isShowTime",msg.isShowTime());
                Map<String,String> map=msg.getParams();
                if(map!=null&&!map.isEmpty()){
                    for(Map.Entry<String,String> item :map.entrySet()){
                        jsonObject.put(item.getKey(),item.getValue());
                    };
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
            PushPlugin.sendMessage(jsonObject,true);
        }
    }

    @Override
    public void onReceiveRegId(Context context, String regId) {
        super.onReceiveRegId(context, regId);
        // 功能介绍：RegId结果返回。当开发者首次调用turnOnPush成功或regId发生改变时会回调该方法。
        Log.d(PushPlugin.TAG,"vivo 推送 onReceiveRegId "+regId);
//        if(PushPlugin.sMViVoPushRegisterCallbackContext!=null){
//            PushPlugin.sMViVoPushRegisterCallbackContext.success(regId);
//        }
    }

    @Override
    public void onTransmissionMessage(Context context, UnvarnishedMessage unvarnishedMessage) {
        super.onTransmissionMessage(context, unvarnishedMessage);
        Log.d(PushPlugin.TAG,unvarnishedMessage.toString());
    }
}
