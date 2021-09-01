package com.beeant.push;


import android.content.Context;
import android.util.Log;
import com.heytap.msp.push.mode.DataMessage;
import com.heytap.msp.push.service.DataMessageCallbackService;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class MyOppoDataMessageCallbackService extends DataMessageCallbackService {
    /**
     * 透传消息处理，应用可以打开页面或者执行命令,如果应用不需要处理透传消息，则不需要重写此方法
     *
     * @param context
     * @param message
     */
    @Override
    public void processMessage(Context context, DataMessage message) {
        super.processMessage(context, message);
        String content = message.getContent();
        // TestModeUtil.addLogString(PushMessageService.class.getSimpleName(), "Receive SptDataMessage:" + content);
        // MessageDispatcher.dispatch(context, content);//统一处理
    }
}
