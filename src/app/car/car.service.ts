import { AppHelper } from "./../appHelper";
import { ApiService } from "src/app/services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
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
  constructor(private apiService: ApiService) {}
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
}
