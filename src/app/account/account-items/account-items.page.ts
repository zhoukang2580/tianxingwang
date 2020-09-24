import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IonDatetime, IonInfiniteScroll } from "@ionic/angular";
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
  private type: string;
  title = "余额";
  typeName = "余额";
  date: string;
  items: any[];
  balance: any;
  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute
  ) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      if (q.get("title")) {
        this.title = q.get("title");
      }
      if (q.get("type")) {
        this.type = q.get("type");
      }
    });
    this.date = this.getDate();
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
    this.accountService.getBalance(this.type).then((b) => {
      this.balance = b;
    });
    this.items = [];
    this.lastId = "";
    this.lastTime = "";
    this.refresher.complete();
    this.scroller.disabled = true;
    this.subscription.unsubscribe();
    this.loadMore();
  }
  loadMore() {
    this.subscription = this.accountService
      .getItems({
        LastId: this.lastId,
        LastTime: this.lastTime,
        Date: this.date.substr(0, 7) + "-01",
        Type: this.type,
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
