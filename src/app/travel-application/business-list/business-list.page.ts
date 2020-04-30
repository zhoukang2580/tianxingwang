import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { TravelService, SearchModel } from "../travel.service";
import { Subscription } from "rxjs";
import { TravelFormEntity } from "src/app/tmc/tmc.service";
import { finalize } from "rxjs/operators";
import { RefresherComponent } from "src/app/components/refresher";
import { IonInfiniteScroll } from "@ionic/angular";

@Component({
  selector: "app-business-list",
  templateUrl: "./business-list.page.html",
  styleUrls: ["./business-list.page.scss"],
})
export class BusinessListPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: TravelService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      if (q.get("doRefresh") == "true") {
        this.doRefresh();
      }
    });
    this.searchModel = {} as any;
    this.searchModel.PageSize = 20;
    this.doRefresh();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  goAddApply() {
    this.router.navigate([AppHelper.getRoutePath("add-apply")]);
  }
  gettravel() {
    this.subscription = this.service
      .getlist(this.searchModel)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            if (this.refresher && this.searchModel.PageIndex <= 1) {
              this.refresher.complete();
            }
          }, 100);
        })
      )
      .subscribe((r) => {
        const arr = (r && r.Data.TravelForms) || [];
        if (this.scroller) {
          this.scroller.disabled = arr.length < this.searchModel.PageSize;
        }
        if (arr.length) {
          this.items = this.items.concat(arr);
          this.searchModel.PageIndex++;
        }
      });
  }
  doRefresh() {
    this.searchModel.PageIndex = 0;
    this.items = [];
    this.subscription.unsubscribe();
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.gettravel();
  }
  async onTravelEdit(id) {
    try {
      const m = await this.service.getTravelDetail(id);
      if (m) {
        if (m.TravelForm) {
          m.TravelForm.Trips = m.TravelForm.Trips || m.Trips;
        }
        this.router.navigate([AppHelper.getRoutePath("add-apply")], {
          queryParams: {
            data: JSON.stringify(m),
          },
        });
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}
