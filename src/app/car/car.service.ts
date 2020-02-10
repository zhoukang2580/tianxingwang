import { IdentityService } from "./../services/identity/identity.service";
import { Storage } from "@ionic/storage";
import { AppHelper } from "./../appHelper";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
import { tap } from "rxjs/operators";
export const KEY_RENTAL_CAR_VERIFY_MOBILE = "_key_rental_car_verify_mobile";
interface ILocalMobile {
  lastUpdateTime: number;
  mobiles: string[];
}
interface Item {
  Name: string;
  RealName: string;
  Email: string;
  Mobile: string;
  IsActiveMobile: string;
  IsActionEmail: string;
  IsReality: string;
}
@Injectable({
  providedIn: "root"
})
export class CarService {
  private accountInfo: Item;
  private fetchPromise: { promise: Promise<Item> };
  private verifiedMobiles: ILocalMobile;
  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private identityService: IdentityService
  ) {
    this.identityService.getIdentitySource().subscribe(_ => {
      this.accountInfo = null;
    });
  }
  getAccountInfo(forceFetch = false) {
    if (!forceFetch) {
      if (this.accountInfo) {
        return Promise.resolve(this.accountInfo);
      }
    }
    if (this.fetchPromise) {
      return this.fetchPromise.promise;
    }
    const req = new RequestEntity();
    req.Method = "ApiAccountUrl-Home-Get";
    this.fetchPromise = {
      promise: this.apiService
        .getPromiseData<Item>(req)
        .then(info => {
          this.accountInfo = info;
          return info;
        })
        .finally(() => {
          this.fetchPromise = null;
        })
    };
    return this.fetchPromise.promise;
  }
  addVerifiedMobile(mobile: string) {
    return this.cacheVerifiedMobile(mobile);
  }
  private async cacheVerifiedMobile(mobile: string) {
    if (!this.verifiedMobiles) {
      await this.loadLocalVerifiedMobiles();
    }
    if (mobile) {
      if (!this.verifiedMobiles.mobiles.find(it => it == mobile)) {
        this.verifiedMobiles.mobiles.push(mobile);
        const identity = await this.identityService
          .getIdentityAsync()
          .catch(_ => null);
        if (identity && identity.Id) {
          this.verifiedMobiles.lastUpdateTime = Date.now();
          await this.storage.set(
            `${identity.Id}_${KEY_RENTAL_CAR_VERIFY_MOBILE}`,
            this.verifiedMobiles
          );
        }
      }
    }
  }
  private async loadLocalVerifiedMobiles() {
    const result = {
      lastUpdateTime: 0,
      mobiles: []
    };
    if (!this.verifiedMobiles) {
      const identity = await this.identityService
        .getIdentityAsync()
        .catch(_ => null);
      if (identity && identity.Id) {
        this.verifiedMobiles = await this.storage.get(
          `${identity.Id}_${KEY_RENTAL_CAR_VERIFY_MOBILE}`
        );
      }
    }
    if (!this.verifiedMobiles) {
      this.verifiedMobiles = result;
    }
    if (
      Date.now() - this.verifiedMobiles.lastUpdateTime >
      30 * 24 * 3600 * 1000
    ) {
      this.verifiedMobiles = result;
    }
    return this.verifiedMobiles;
  }
  async checkIfMobileIsVerified(mobile: string) {
    if (!this.verifiedMobiles) {
      await this.loadLocalVerifiedMobiles();
    }
    return this.verifiedMobiles.mobiles.some(it => it == mobile);
  }
  async verifyStaff(data: { Mobile: string }) {
    const req = new RequestEntity();
    req.Method = "TmcApiCarUrl-Car-VerifyStaff";
    req.Data = {
      Mobile: data.Mobile
    };
    req.IsShowLoading = true;
    return this.apiService.getPromiseData<string>(req).catch(e => {
      AppHelper.alert(e);
      return "";
    });
  }
  getLocalMobiles() {
    return this.loadLocalVerifiedMobiles();
  }
  validateMobileCode(mobile: string, mobileCode: string) {
    const req = new RequestEntity();
    req.Url = AppHelper.getApiUrl() + "/Home/ValidateIdentityMobileCode";
    req.IsShowLoading = true;
    req.Data = { Mobile: mobile, MobileCode: mobileCode };
    return this.apiService
      .getResponse<{
        SendInterval: number;
        ExpiredInterval: number;
      }>(req)
      .pipe(
        tap(res => {
          if (res && res.Status) {
            this.addVerifiedMobile(mobile);
          }
        })
      );
  }
  sendMobileCode(mobile: string) {
    const req = new RequestEntity();
    req.Url = AppHelper.getApiUrl() + "/Home/SendIdentityMobileCode";
    req.Data = JSON.stringify({ Mobile: mobile });
    return this.apiService.getResponse<{
      SendInterval: number;
      ExpiredInterval: number;
    }>(req);
  }
}
