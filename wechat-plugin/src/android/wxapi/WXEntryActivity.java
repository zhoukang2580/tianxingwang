package com.skytrip.dmonline.wxapi;

import android.app.Activity;
import android.os.Bundle;
import android.widget.Toast;

import com.beeant.app.wechat.Wechat;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;

import org.apache.cordova.CallbackContext;


public  class WXEntryActivity extends Activity implements IWXAPIEventHandler {
    private IWXAPI mWxApi = Wechat.sWxApi;
    private CallbackContext mCallbackContext=Wechat.sCallbackContext;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if(mWxApi!=null){
            mWxApi.handleIntent(getIntent(),this);
        }
    }

    @Override
    public void onReq(BaseReq baseReq) {

    }

    @Override
    public void onResp(BaseResp baseResp) {
        SendAuth.Resp re = ((SendAuth.Resp) baseResp);
        String code = re.code;
        if(null!=mCallbackContext){
            if(baseResp.errCode==BaseResp.ErrCode.ERR_OK){
                mCallbackContext.success(code);
            }else{
                mCallbackContext.error(re.errStr);
            }
        }
        Toast.makeText(this, baseResp.errCode, Toast.LENGTH_LONG).show();
        Toast.makeText(this, code, Toast.LENGTH_LONG).show();

    }
}