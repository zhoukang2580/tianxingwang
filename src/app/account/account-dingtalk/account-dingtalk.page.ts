import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { IonList } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { Observable, merge, of, Subscription } from 'rxjs';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { map, switchMap } from 'rxjs/operators';
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
  @ViewChild('List') deviceList: IonList;
  constructor(private apiService: ApiService) {

  }

  ngOnInit() {
    this.load();
  }
  load() {
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Dingtalk-List";
    req.IsShowLoading=true;
    let deviceSubscription = this.apiService.getResponse<Item[]>(req).pipe(map(r => r.Data)).subscribe(r => {
      this.items = r;
    },()=>{
      if(deviceSubscription)
      {
        deviceSubscription.unsubscribe();
      }
    });
  }
  delete(item: Item) {
    const req = new BaseRequest();
    req.Method = "ApiPasswordUrl-Dingtalk-Remove";
    req.IsShowLoading=true;
    req.Data={
      Id:item.Id
    };
    let deviceSubscription = this.apiService.getResponse<{}>(req).subscribe(s => {
      this.items=this.items.filter(it=>it!=item);
    }, n => {
      alert(n);
    },()=>{
      if(deviceSubscription)
      {
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
