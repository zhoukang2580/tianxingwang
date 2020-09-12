import { DingtalkHelper } from "./../../dingtalkHelper";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { IonList, NavController, Config } from "@ionic/angular";
import { ApiService } from "src/app/services/api/api.service";
import { Observable, merge, of, Subscription } from "rxjs";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, switchMap } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";
import { CONFIG } from "src/app/config";
type Item = {
  Id: string;
  Name: string;
};
@Component({
  selector: "app-account-dingtalk",
  templateUrl: "./account-dingtalk.page.html",
  styleUrls: ["./account-dingtalk.page.scss"],
})
export class AccountDingtalkPage implements OnInit, OnDestroy {
  toggleChecked = false;
  items: Item[] = [];
  isShowBindButton: boolean;
  @ViewChild("List") deviceList: IonList;
  appName = CONFIG.appTitle;
  constructor(private apiService: ApiService, private navCtrl: NavController) { }
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {
    this.isShowBindButton = AppHelper.isDingtalkH5();
    var paramters = AppHelper.getQueryParamers();
    this.load();
    if (paramters.path == "account-dingtalk") {
      if (paramters.dingtalkcode) {
        const data = {
          Code: paramters.dingtalkcode,
        };
        this.bindCode(data);
        AppHelper.removeQueryParamers("dingtalkcode");
      }
    }
  }
  async bind() {
    if (AppHelper.isDingtalkH5()) {
      let url = `${AppHelper.getApiUrl()}/home/GetDingTalkCode?domain=${AppHelper.getDomain()}&${AppHelper.getTicketName()}=${AppHelper.getTicket()}&path=account-dingtalk`;
      const filterKeys = ["domain", AppHelper.getTicketName(), "path", "IsLogin", "wechatcode"];
      url = this.concatParams(url, filterKeys);
      AppHelper.redirect(url);
    }
  }
  private concatParams(url: string, filterKeys: string[]) {
    const paramters = AppHelper.getQueryParamers();
    if (paramters && Object.keys(paramters).length) {
      url +=
        "&" +
        Object.keys(paramters)
          .filter(
            (k) => !filterKeys.find((it) => it.toLowerCase() == k.toLowerCase())
          )
          .map((k) => `${k}=${paramters[k]}`)
          .join("&");
    }
    return url;
  }
  bindCode(data) {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-DingTalk-Bind";
    req.IsShowLoading = true;
    req.Data = data;
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(
      (s) => {
        if (s.Status) {
          this.load();
        }
        if (s.Message) {
          AppHelper.alert(s.Message);
        }
      },
      (n) => {
        AppHelper.alert(n);
      },
      () => {
        if (deviceSubscription) {
          deviceSubscription.unsubscribe();
        }
      }
    );
  }
  // getDingTalkCode(appId: string) {
  //   const DingTalk = window['DingTalk'];
  //   if (DingTalk) {
  //     return DingTalk.getCode(appId);
  //   }
  //   return Promise.reject("cordova DingTalk plugin is unavailable");
  // }
  load() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-DingTalk-List";
    let deviceSubscription = this.apiService
      .getResponse<Item[]>(req)
      .pipe(map((r) => r.Data))
      .subscribe(
        (r) => {
          this.items = r;
        },
        () => {
          if (deviceSubscription) {
            deviceSubscription.unsubscribe();
          }
        }
      );
  }
  delete(item: Item) {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-DingTalk-Remove";
    req.IsShowLoading = true;
    req.Data = {
      Id: item.Id,
    };
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(
      (s) => {
        this.items = this.items.filter((it) => it != item);
      },
      (n) => {
        AppHelper.alert(n);
      },
      () => {
        if (deviceSubscription) {
          deviceSubscription.unsubscribe();
        }
      }
    );
  }
  itemClick() { }
  ngOnDestroy() { }
  toggleDeleteButton() {
    this.deviceList.closeSlidingItems();
    setTimeout(
      () => {
        this.toggleChecked = !this.toggleChecked;
      },
      this.toggleChecked ? 300 : 0
    );
  }
  onSlidingItemDrag() {
    this.toggleChecked = false;
  }
}
