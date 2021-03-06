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
  styleUrls: ["./account-Wechat.page.scss"],
})
export class AccountWechatPage implements OnInit, OnDestroy {
  toggleChecked = false;
  items: Item[] = [];
  isShowBindButton: boolean;
  @ViewChild("List") deviceList: IonList;
  constructor(private apiService: ApiService, private navCtrl: NavController) { }
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {
    this.isShowBindButton =
      AppHelper.isApp() || AppHelper.isWechatH5() || AppHelper.isWechatMini();
    this.load();
    const paramters = AppHelper.getQueryParamers();
    if (paramters.path == "account-wechat") {
      if (paramters.wechatcode) {
        const data = {
          Code: paramters.wechatcode,
        };
        this.bindCode(data);
        AppHelper.removeQueryParamers("wechatcode");
      } else if (paramters.wechatminicode) {
        const data = {
          Code: paramters.wechatminicode,
          NickName: paramters.wechatmininickname,
          SdkType: "Mini",
        };
        this.bindCode(data);
        AppHelper.removeQueryParamers("wechatminicode");
        AppHelper.removeQueryParamers("wechatmininickname");
      }
    }
  }
  async bind() {
    try {
      if (AppHelper.isApp()) {
        const appId = AppHelper.getWechatAppId();
        const code = await this.getWechatCode(appId).catch(() => null);
        if (code) {
          const data = {
            Code: code,
            SdkType: "App",
          };
          this.bindCode(data);
        }
      } else if (AppHelper.isWechatMini()) {
        const key = AppHelper.uuid();
        const token =
          (this.apiService.apiConfig && this.apiService.apiConfig.Token) || "";
        WechatHelper.wx.miniProgram.navigateTo({
          url: "/pages/login/index?key=" + key + "&token=" + token,
        });
        WechatHelper.checkStep(key, this.apiService, (val) => {
          try {
            const wechatMiniUser = JSON.parse(val);
            const data = {
              Code: wechatMiniUser.wechatminicode,
              NickName: wechatMiniUser.nickName,
              SdkType: "Mini",
            };
            this.bindCode(data);
          } catch (e) { }
        });
      } else if (AppHelper.isWechatH5()) {
        let url = `${AppHelper.getApiUrl()}/home/GetWechatCode?domain=${AppHelper.getDomain()}&${AppHelper.getTicketName()}=${AppHelper.getTicket()}&path=account-wechat`;
        const filterKeys = [
          "domain",
          AppHelper.getTicketName(),
          "path",
          "IsLogin",
          "wechatcode",
        ];
        url = this.concatParams(url, filterKeys);
        AppHelper.redirect(url);
      }
    } catch (e) {
      AppHelper.alert(e);
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
    req.Method = "ApiPasswordUrl-Wechat-Bind";
    req.IsShowLoading = true;
    req.Data = data;
    const deviceSubscription = this.apiService
      .getResponse<{ OpenId: string }>(req)
      .subscribe(
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
  getWechatCode(appId: string) {
    return AppHelper.getWechatCode(appId);
  }
  load() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Wechat-List";
    const deviceSubscription = this.apiService
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
    req.Method = "ApiPasswordUrl-Wechat-Remove";
    req.IsShowLoading = true;
    req.Data = {
      Id: item.Id,
    };
    const deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(
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
