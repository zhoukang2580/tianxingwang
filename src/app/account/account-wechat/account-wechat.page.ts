import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { IonList, NavController } from "@ionic/angular";
import { ApiService } from "src/app/services/api/api.service";
import { Observable, merge, of, Subscription } from "rxjs";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, switchMap } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";
import { WechatHelper } from "src/app/wechatHelper";
type Item = {
  Id: string;
  Name: string;
};
@Component({
  selector: "app-account-Wechat",
  templateUrl: "./account-Wechat.page.html",
  styleUrls: ["./account-Wechat.page.scss"]
})
export class AccountWechatPage implements OnInit, OnDestroy {
  toggleChecked = false;
  items: Item[] = [];
  isShowBindButton: boolean;
  @ViewChild("List") deviceList: IonList;
  constructor(private apiService: ApiService, private navCtrl: NavController) {}
  back() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.isShowBindButton =
      AppHelper.isApp() || AppHelper.isWechatH5() || AppHelper.isWechatMini();
    this.load();
    var paramters = AppHelper.getQueryParamers();
    if (paramters.path == "account-wechat") {
      if (paramters.wechatcode) {
        const data = {
          Code: paramters.wechatcode
        };
        this.bindCode(data);
      } else if (paramters.wechatminicode) {
        const data = {
          Code: paramters.wechatminicode,
          SdkType: "Mini"
        };
        this.bindCode(data);
      }
    }
  }
  async bind() {
    try {
      if (AppHelper.isApp()) {
        const appId = await AppHelper.getWechatAppId();
        const code = await this.getWechatCode(appId).catch(() => null);
        if (code) {
          const data = {
            Code: code,
            WechatSdkType: "App"
          };
          this.bindCode(data);
        }
      } else if (AppHelper.isWechatMini()) {
        WechatHelper.wx.miniProgram.navigateTo({
          url:
            "/pages/login/index?ticket=" +
            AppHelper.getTicket() +
            "&path=account-wechat&openid=" +
            (WechatHelper.openId || "")
        });
      } else if (AppHelper.isWechatH5()) {
        var url =
          AppHelper.getApiUrl() +
          "/home/GetWechatCode?domain=" +
          AppHelper.getDomain() +
          "&ticket=" +
          AppHelper.getTicket() +
          "&path=" +
          encodeURIComponent(
            AppHelper.getRedirectUrl() +
              "?path=account-wechat&openid=" +
              (WechatHelper.openId || "")
          );
        AppHelper.redirect(url);
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  bindCode(data) {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Wechat-Bind";
    req.IsShowLoading = true;
    req.Data = data;
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(
      s => {
        if (s.Status) {
          this.load();
        } else if (s.Message) {
          AppHelper.alert(s.Message);
        }
      },
      n => {
        AppHelper.alert(n);
      },
      () => {
        if (deviceSubscription) {
          deviceSubscription.unsubscribe();
        }
      }
    );
  }
  getWechatCode(appId: string) {
    const wechat = window["wechat"];
    if (wechat) {
      return wechat.getCode(appId);
    }
    return Promise.reject("cordova wechat plugin is unavailable");
  }
  load() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Wechat-List";
    let deviceSubscription = this.apiService
      .getResponse<Item[]>(req)
      .pipe(map(r => r.Data))
      .subscribe(
        r => {
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
    req.Method = "ApiPasswordUrl-Wechat-Remove";
    req.IsShowLoading = true;
    req.Data = {
      Id: item.Id
    };
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(
      s => {
        this.items = this.items.filter(it => it != item);
      },
      n => {
        AppHelper.alert(n);
      },
      () => {
        if (deviceSubscription) {
          deviceSubscription.unsubscribe();
        }
      }
    );
  }
  itemClick() {}
  ngOnDestroy() {}
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
