import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { IonInfiniteScroll } from "@ionic/angular";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { RefresherComponent } from "src/app/components/refresher";
import { AccountService } from "../account.service";

@Component({
  selector: "app-account-items",
  templateUrl: "./account-items.page.html",
  styleUrls: ["./account-items.page.scss"],
})
export class AccountItemsPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(RefresherComponent, { static: true })
  private refresher: RefresherComponent;
  private lastTime: string;
  private lastId: string;
  date: string;
  items: any[];
  constructor(private accountService: AccountService) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.doRefresh();
  }
  private getDate() {
    const now = new Date();
    const m =
      now.getMonth() < 9 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1;
    const d =
      now.getDate() < 10 ? "0" + (now.getDate() + 1) : now.getDate() + 1;
    return `${now.getFullYear()}-${m}-${d}`;
  }
  doRefresh() {
    this.items = [];
    this.lastId = "";
    this.lastTime = "";
    this.date = this.getDate();
    this.refresher.complete();
    this.subscription.unsubscribe();
    this.loadMore();
  }
  loadMore() {
    this.subscription = this.accountService
      .getItems({
        LastId: this.lastId,
        LastTime: this.lastTime,
        Date: this.date,
      })
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.scroller.complete();
          }, 200);
        })
      )
      .subscribe((r) => {
        if (r && r.Data) {
          this.lastId = r.Data.LastId;
          this.lastTime = r.Data.LastTime;
          const arr = r.Data.Datas || [];
          this.scroller.disabled = arr.length < 20;
          if (arr.length) {
            this.items = this.items.concat(arr);
          }
        }
      });
  }
}
