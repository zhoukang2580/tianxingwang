import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { IonList } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { Observable, merge, of, Subscription } from 'rxjs';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { map, switchMap } from 'rxjs/operators';
import { AppHelper } from 'src/app/appHelper';
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
  @ViewChild('List') deviceList: IonList;
  constructor(private apiService: ApiService) {

  }

  ngOnInit() {
    this.isShowBindButton =!AppHelper.isApp() && AppHelper.isWechatH5();
    this.load();
    var paramters=AppHelper.getQueryParamers();
    if(paramters.path=="account-wechat")
    {
      if(paramters.message)
      {
        AppHelper.alert(paramters.message);
      }
    }
  }
  async bind() {
    try {
      if (AppHelper.isApp()) {
        const appId = await AppHelper.getWechatAppId();
        const code = await this.getWechatCode(appId).catch(() => null);
        if (code) {
          const req = new RequestEntity();
          req.Method = "ApiPasswordUrl-Wechat-BindCode";
          req.IsShowLoading = true;
          req.Data = {
            Code: code
          };
          let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(s => {
            if (s.Status) {
              this.load();
            }
          }, n => {
            AppHelper.alert(n);
          }, () => {
            if (deviceSubscription) {
              deviceSubscription.unsubscribe();
            }
          });
        }
      }
      else if (AppHelper.isWechatH5() || AppHelper.isWechatMini()) {
        var url=AppHelper.getApiUrl()+"/home/BindWechat?domain="+AppHelper.getDomain()+"&ticket="+AppHelper.getTicket()
        +"&path="+encodeURIComponent(AppHelper.getRedirectUrl()+"?path=account-wechat");
          AppHelper.redirect(url);
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }

  getWechatCode(appId: string) {
    const wechat = window['wechat'];
    if (wechat) {
      return wechat.getCode(appId);
    }
    return Promise.reject("cordova wechat plugin is unavailable");
  }
  load() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Wechat-List";
    let deviceSubscription = this.apiService.getResponse<Item[]>(req).pipe(map(r => r.Data)).subscribe(r => {
      this.items = r;
    }, () => {
      if (deviceSubscription) {
        deviceSubscription.unsubscribe();
      }
    });
  }
  delete(item: Item) {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Wechat-Remove";
    req.IsShowLoading = true;
    req.Data = {
      Id: item.Id
    };
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(s => {
      this.items = this.items.filter(it => it != item);
    }, n => {
      AppHelper.alert(n);
    }, () => {
      if (deviceSubscription) {
        deviceSubscription.unsubscribe();
      }
    });
  }
  itemClick() {

  }
  ngOnDestroy() {
  }
  toggleDeleteButton() {
    this.deviceList.closeSlidingItems();
    setTimeout(() => {
      this.toggleChecked = !this.toggleChecked;
    }, this.toggleChecked ? 300 : 0);
  }
  onSlidingItemDrag() {
    this.toggleChecked = false;
  }
}
