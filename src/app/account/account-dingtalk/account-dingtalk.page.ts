import { DingtalkHelper } from "./../../dingtalkHelper";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { IonList, NavController } from "@ionic/angular";
import { ApiService } from "src/app/services/api/api.service";
import { Observable, merge, of, Subscription } from "rxjs";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, switchMap } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";
type Item = {
  Id: string;
  Name: string;
};
@Component({
  selector: "app-account-dingtalk",
  templateUrl: "./account-dingtalk.page.html",
  styleUrls: ["./account-dingtalk.page.scss"]
})
export class AccountDingtalkPage implements OnInit, OnDestroy {
  toggleChecked = false;
  items: Item[] = [];
  isShowBindButton: boolean;
  @ViewChild("List") deviceList: IonList;
  constructor(private apiService: ApiService, private navCtrl: NavController) {}
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
          Code: paramters.dingtalkcode
        };
        this.bindCode(data);
      }
    }
  }
  async bind() {
    if (AppHelper.isDingtalkH5()) {
      var url =
        AppHelper.getApiUrl() +
        "/home/GetDingTalkCode?domain=" +
        AppHelper.getDomain() +
        "&ticket=" +
        AppHelper.getTicket() +
        "&path=" +
        encodeURIComponent(
          AppHelper.getApiUrl() + "/index.html?path=account-dingtalk"
        );
      AppHelper.redirect(url);
    }
  }
  bindCode(data) {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-DingTalk-Bind";
    req.IsShowLoading = true;
    req.Data = data;
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(
      s => {
        if (s.Status) {
          this.load();
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
    req.Method = "ApiPasswordUrl-DingTalk-Remove";
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
