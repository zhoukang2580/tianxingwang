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
  selector: "app-account-device",
  templateUrl: "./account-device.page.html",
  styleUrls: ["./account-device.page.scss"]
})
export class AccountDevicePage implements OnInit, OnDestroy {
  toggleChecked = false;
  items: Item[] = [];
  @ViewChild("List", { static: false }) deviceList: IonList;
  constructor(private apiService: ApiService, private navCtrl: NavController) { }

  ngOnInit() {
    this.load();
  }
  back() {
    this.navCtrl.pop();
  }
  load() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Device-List";
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
    req.Method = "ApiPasswordUrl-Device-Remove";
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
        setTimeout(() => {
          if (deviceSubscription) {
            deviceSubscription.unsubscribe();
          }
        }, 100);
      }
    );
  }
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
