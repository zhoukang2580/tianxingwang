import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import {
  TravelService,
  SearchModel,
  ApprovalStatusType,
} from "../travel.service";
import { Subscription } from "rxjs";
import { TravelFormEntity } from "src/app/tmc/tmc.service";
import { finalize } from "rxjs/operators";
import { RefresherComponent } from "src/app/components/refresher";
import { IonInfiniteScroll } from "@ionic/angular";
import { StaffService, StaffEntity } from "src/app/hr/staff.service";

@Component({
  selector: "app-business-list",
  templateUrl: "./business-list.page.html",
  styleUrls: ["./business-list.page.scss"],
})
export class BusinessListPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  ApprovalStatusType = ApprovalStatusType;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  customPopoverOptions: any = {
    header: "选择审批单状态",
    // subHeader: 'Select your hair color',
    // message: 'Only select your dominant hair color'
  };
  staff: StaffEntity;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: TravelService,
    private staffService: StaffService
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
  onSearch(b) {
    this.searchModel.IsShowLoading = b;
    console.log(this.searchModel.StatusType, "searchModel.StatusType");
    console.log(this.searchModel.SearchContent, "searchModel.AccountId");
    this.doRefresh(true);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  goAddApply() {
    this.router.navigate([AppHelper.getRoutePath("add-apply")], {
      queryParams: { tabId: "1" },
    });
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
        const arr = (r && r.Data && r.Data.TravelForms) || [];
        if (this.scroller) {
          this.scroller.disabled = arr.length < this.searchModel.PageSize;
        }
        if (arr.length) {
          this.items = this.items.concat(arr).map((it) => {
            if (it.ApplyTime) {
              it.ApplyTime =
                it.ApplyTime.startsWith("1800") ||
                it.ApplyTime.startsWith("0001")
                  ? ""
                  : it.ApplyTime.replace("T", " ")
                      .substring(0, 16)
                      .replace(/-/g, ".");
            }
            if (it.ApprovalTime) {
              it.ApprovalTime =
                it.ApprovalTime.startsWith("1800") ||
                it.ApprovalTime.startsWith("0001")
                  ? ""
                  : it.ApprovalTime.replace("T", " ")
                      .substring(0, 16)
                      .replace(/-/g, ".");
            }
            if (it.Trips && it.Trips.length) {
              it.startDate = it.Trips[0].StartDate.substring(0, 10).replace(
                /-/g,
                "."
              );
            }
            return it;
          });
          this.searchModel.PageIndex++;
        }
      });
  }

  doRefresh(isKeepCondition = false) {
    this.staffService.getStaff().then((s) => {
      this.staff = s;
    });
    if (this.searchModel) {
      if (!isKeepCondition) {
        this.searchModel.StatusType = 0;
        this.searchModel.SearchContent = "";
      }
      this.searchModel.PageIndex = 0;
    }
    this.items = [];
    this.subscription.unsubscribe();
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.gettravel();
  }
  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };
  async onTravelEdit(id) {
    try {
      const m = await this.service.getTravelDetail(id);
      if (m) {
        // if (m.TravelForm) {
        //   m.TravelForm.Trips = m.TravelForm.Trips ;
        // }
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
  onCancel(id, event: CustomEvent) {
    event.stopPropagation();
    try {
      const m = this.service.travelCancel(id).then((t) => {
        AppHelper.alert(t.Message);
        this.doRefresh();
      });
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  // getCityName(name: string) {
  //   // debugger
  //   let idxStart = name.indexOf("(");
  //   let result = name.substring(0, idxStart);
  //   if (result) {
  //     return result
  //   }
  //   return name
  // }
}
