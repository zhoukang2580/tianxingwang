import { HttpClient } from "@angular/common/http";
import { BaseRequest } from "../api/BaseRequest";
import { ApiService } from "../api/api.service";
import { IdentityService } from "../identity/identity.service";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { tap, switchMap, map, finalize } from "rxjs/operators";
import { of, throwError, from } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { Platform, LoadingController } from "@ionic/angular";
import { IResponse } from '../api/IResponse';
@Injectable({
  providedIn: "root"
})
export class BindService {
  ImageValue: string;
  isBindMobile: boolean = true;
  isBindDevice: boolean = true;
  private _toPageRouter: string;// 因要授权而不能跳转的页面
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private apiService: ApiService,
    private platService: Platform,
    private http: HttpClient
  ) { }
  getImage() {
    const req = new BaseRequest();
    req.Method = "Home-CreateCode";
    req.Url = AppHelper.getApiUrl();
    return this.http.get(`${AppHelper.getApiUrl()}/Home/CreateCode`).pipe(
      map((r: IResponse<{ Code: string; Value: string }>) => {
        console.log(r);
        if (r.Data) {
          this.ImageValue= r.Data.Value;
          return `${AppHelper.getApiUrl()}/Home/ImageCode?code=${r.Data.Code}`;
        }
        return r.Message || "网络错误";
      })
    );
  }
  sendMobileCode(mobile: string, imageCode: string) {
    const req = new BaseRequest();
    req.Url = AppHelper.getApiUrl()+'/Home/ImageCode';
    req.ImageCode = imageCode;
    req.ImageValue = this.ImageValue;
    req.Data = JSON.stringify({ Mobile: mobile });
    return this.apiService.getResponse<{
      SendStep: number;
    }>(req);
  }
  async checkDevice() {
    if (AppHelper.isH5()) {
      this.isBindDevice = true;
      return true;
    }

    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Device-Check";
    req.Data = JSON.stringify({
      DeviceNumber: await AppHelper.getUUID()
    });
    return this.apiService
      .getResponse<{}>(req)
      .pipe(
        switchMap(r => {
          if (r.Status) {
            this.router.navigate[AppHelper.getRoutePath("device")];
            this.isBindDevice = false;
          }
          return of(r.Data);
        })
      );
  }
  async checkMobile() {
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Mobile-Check";
    return this.apiService
      .getResponse<{}>(req)
      .pipe(
        switchMap(r => {
          if (r.Status) {
            this.isBindMobile = false;
            this.router.navigate[AppHelper.getRoutePath("device")];
          }
          return of(r.Data);
        })
      );
  }
  async bind(mobileCode: string) {
    var r=await this.bindMobile(mobileCode);
    if(r)
    {
      r= await this.bindDevice(mobileCode);
    }
    return r;
  }
  async bindMobile(mobileCode: string) {
    if (this.isBindMobile)
      return Promise.resolve(true);
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Device-Bind";
    req.Data = JSON.stringify({
      Tag: await AppHelper.getDeviceName(),
      MobileCode: mobileCode,
      DeviceNumber: await AppHelper.getUUID(),
      DeviceName: await AppHelper.getDeviceName()
    });

    return new Promise((resolve, reject) => {
      this.apiService.getResponse<{}>(req).subscribe(r =>{
        if(r && r.Status)
        {
          this.isBindMobile=true;
        }
        resolve(r && r.Status), error => {
          resolve(false)
        }
      }
        
      );
    })
  }
  async bindDevice(mobileCode: string) {
    if (!AppHelper.isH5())
      return Promise.resolve(true);
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Device-Bind";
    req.Data = JSON.stringify({
      Tag: await AppHelper.getDeviceName(),
      MobileCode: mobileCode,
      DeviceNumber: await AppHelper.getUUID(),
      DeviceName: await AppHelper.getDeviceName()
    });
    return new Promise((resolve, reject) => {
      return this.apiService.getResponse<{}>(req).subscribe(r=>{
        if(r && r.Status)
        {
          this.isBindDevice=true;
        }
        resolve(r && r.Status), error => {
          resolve(false)
        }
      })
    });

  }
}
