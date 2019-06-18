package com.skytrip.dmonline.wxapi;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.beeant.plugin.wechat.Wechat;
import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;

import org.apache.cordova.CallbackContext;


public class WXPayEntryActivity extends Activity implements IWXAPIEventHandler {
    private IWXAPI mWxApi = Wechat.sWxApi;
    private CallbackContext mCallbackContext = Wechat.sCallbackContext;

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        Log.d("WXPayEntryActivity", "onRestoreInstanceState mWxApi != null" + (mWxApi != null));
        if (mWxApi != null) {
            boolean ok = mWxApi.handleIntent(getIntent(), this);
            Log.d("WXPayEntryActivity", "处理是否ok=" + ok);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("WXPayEntryActivity", "onCreate mWxApi != null" + (mWxApi != null));
        if (mWxApi != null) {
            boolean ok = mWxApi.handleIntent(getIntent(), this);
            Log.d("WXPayEntryActivity", "处理是否ok=" + ok);
        }
    }

    @Override
    public void onReq(BaseReq baseReq) {
        finish();
    }

    @Override
    public void onResp(BaseResp baseResp) {
        Log.d("WXPayEntryActivity", "onResp mCallbackContext != null" + (mCallbackContext != null));
        if (null != mCallbackContext) {
            if (baseResp.getType() == ConstantsAPI.COMMAND_SENDAUTH) {
                if (baseResp.errCode == BaseResp.ErrCode.ERR_OK) {
                    SendAuth.Resp re = ((SendAuth.Resp) baseResp);
                    String code = re.code;
                    mCallbackContext.success(code);
                } else {
                    mCallbackContext.error(baseResp.errCode+"");
                }
            }
            if(baseResp.getType()==ConstantsAPI.COMMAND_PAY_BY_WX){
                Log.d("WXPayEntryActivity","onPayFinish,errCode="+baseResp.errCode);
              if(baseResp.errCode==0){
                  mCallbackContext.success();
              }else {
                  mCallbackContext.error(baseResp.errCode+"");
              }
            }
        }

//        Toast.makeText(this, "errCode "+baseResp.errCode+"", Toast.LENGTH_LONG).show();
//        Toast.makeText(this, "openId "+baseResp.openId+"", Toast.LENGTH_LONG).show();
        finish();
    }
}