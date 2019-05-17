import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from "@angular/core";
import { IonList } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { Observable, merge, of, Subscription } from 'rxjs';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { map, switchMap } from 'rxjs/operators';
import { AppHelper } from 'src/app/appHelper';
import { DomSanitizer } from '@angular/platform-browser';
type Item = {
  Id: string;
  Name: string;
};
@Component({
  selector: "app-account-Wechat",
  templateUrl: "./account-Wechat.page.html",
  styleUrls: ["./account-Wechat.page.scss"]
})
export class AccountWechatPage implements OnInit,AfterViewInit, OnDestroy {
  toggleChecked = false;
  items: Item[] = [];
  isShowBindButton: boolean;
  isShowIframe:boolean;
  @ViewChild('List') deviceList: IonList;
  constructor(private apiService: ApiService,private sanitizer:DomSanitizer) {

  }
  ngAfterViewInit(){
    if(this.isShowIframe)
    {  
      window.addEventListener("message",evt=>{
        this.apiService.hideLoadingView();
        if(evt.data&& typeof evt.data==='string')
        {
          var json=JSON.parse(evt.data);
          if(json && json.Channel=="Bind" && json.Message)
          {
            alert(json.Message);
          }
        }
      });
    }
  }
  ngOnInit() {
    this.isShowBindButton =true;//AppHelper.isApp() || AppHelper.isWechatH5();
    this.isShowIframe=true;//AppHelper.isWechatH5() || AppHelper.isH5();
    this.load();
  }
  async bind() {
    try {
      if (AppHelper.isApp()) {
        const appId = await AppHelper.getWechatAppId();
        const code = await this.getWechatCode(appId).catch(() => null);
        if (code) {
          const req = new BaseRequest();
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
            alert(n);
          }, () => {
            if (deviceSubscription) {
              deviceSubscription.unsubscribe();
            }
          });
        }
      }
      //else if (AppHelper.isWechatH5()) {
        this.apiService.showLoadingView();
        var iframe=document.getElementById("iframe") as HTMLIFrameElement;
        var url=AppHelper.getApiUrl()+"/home/BindWechat?domain="+AppHelper.getDomain()+"&ticket="+AppHelper.getTicket();
          iframe.src=url;
          setTimeout(()=>{
            this.apiService.hideLoadingView();
          },10000);
      //}
    } catch (e) {
      alert(e);
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
    const req = new BaseRequest();
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
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Wechat-Remove";
    req.IsShowLoading = true;
    req.Data = {
      Id: item.Id
    };
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(s => {
      this.items = this.items.filter(it => it != item);
    }, n => {
      alert(n);
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
