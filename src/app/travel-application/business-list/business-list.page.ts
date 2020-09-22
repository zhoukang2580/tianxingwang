import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import {
  TravelService,
  SearchModel,
  ApprovalStatusType,
  TmcTravelApprovalType
} from "../travel.service";
import { Subscription } from "rxjs";
import { TmcEntity, TravelFormEntity } from "src/app/tmc/tmc.service";
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
  TravelApprovalType = TmcTravelApprovalType;
  private subscription = Subscription.EMPTY;
  ApprovalStatusType = ApprovalStatusType;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  tmc: TmcEntity;
  loading = true;
  customPopoverOptions: any = {
    header: "选择审批单状态",
    // subHeader: 'Select your hair color',
    // message: 'Only select your dominant hair color'
  };
  staff: StaffEntity;
  appovalStaff: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: TravelService,
    private staffService: StaffService,
    private keyboard: Keyboard
  ) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      if (q.get("doRefresh") == "true") {
        this.doRefresh();
        this.staffService.getStaff().then((s) => {
          this.staff = s;
        });
      }
    });
    this.searchModel = {} as any;
    this.searchModel.PageSize = 20;
    this.doRefresh();
  }

  onSearch(b) {
    this.keyboard.hide();
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

  onDelete(item, key, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    this.service
      .removeTravel(item.Id)
      .then(() => {
        this.items.splice(key, 1);
      })
      .catch((e) => {
        AppHelper.alert(e);
      });
  }
  gettravel() {
    this.loading = true;
    this.subscription = this.service
      .getlist(this.searchModel)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loading=false;
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
          const tempArr = arr.map((it) => {
            if (it.ApplyTime) {
              it.ApplyTime = this.transformDataTime({
                time: it.ApplyTime,
                hasTime: true,
                withDot: true,
              });
            }
            if (it.InsertTime) {
              it.InsertTime = this.transformDataTime({
                time: it.InsertTime,
                hasTime: true,
                withDot: true,
              });
            }
            if (it.ApprovalTime) {
              it.ApprovalTime = this.transformDataTime({
                time: it.ApprovalTime,
                hasTime: true,
                withDot: true,
              });
            }
            if (it.Trips && it.Trips.length) {
              it.Trips = it.Trips.map((trip) => {
                trip.StartDate = this.transformDataTime({
                  time: trip.StartDate,
                  hasTime: false,
                  withDot: false,
                });
                trip.EndDate = this.transformDataTime({
                  time: trip.EndDate,
                  hasTime: false,
                  withDot: false,
                });
                trip.ToCityName = this.strip(trip.ToCityName);
                trip.FromCityName = this.strip(trip.FromCityName);
                return trip;
              });
              it.startDate = this.transformDataTime({
                time: it.Trips[0].StartDate,
                hasTime: false,
                withDot: true,
              });
            }
            this.getVariablesJsonObj(it);
            if(it.VariablesJsonObj){

              const str = it.VariablesJsonObj.ApprovalName;
              if (str) {
                it.VariablesJsonObj.ApprovalName = str.replace(/→/g, ' ⇀ ');
              }
            }
            return it;
          });
          this.items = this.items.concat(tempArr);
          this.searchModel.PageIndex++;
        }
      });
  }

  private getVariablesJsonObj(it: TravelFormEntity) {
    if (it.Variables) {
      it.VariablesJsonObj = JSON.parse(it.Variables);
    }
  }

  private strip(name: string) {
    if (!name) {
      return name;
    }
    let idx = name.indexOf("(");
    if (idx > -1) {
      return name.substring(0, idx);
    }
    idx = name.indexOf(")");
    if (idx > -1) {
      return name.substring(0, idx);
    }
    return name.replace(/,/g, " · ");
  }
  private transformDataTime({
    time,
    hasTime,
    withDot,
  }: {
    time: string;
    hasTime: boolean;
    withDot: boolean;
  }) {
    if (time) {
      time =
        time.startsWith("1800") || time.startsWith("0001")
          ? ""
          : time.replace("T", " ").substring(0, hasTime ? 16 : 10);
      if (withDot) {
        time = time.replace(/-/g, ".");
      }
    }
    return time;
  }
  doRefresh(isKeepCondition = false) {
    // this.staffService.getStaff().then((s) => {
    //   this.staff = s;
    // });
    this.keyboard.hide();
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

  // async onTravelEdit(id, evt: CustomEvent) {
  //   try {
  //     if (evt) {
  //       evt.stopPropagation()
  //     }
  //     this.router.navigate([AppHelper.getRoutePath("add-apply")], {
  //       queryParams: {
  //         id: id,
  //       },
  //     });
  //   } catch (e) {
  //     AppHelper.alert(e);
  //   }
  // }

  onGotoDetail(item: any, evt: CustomEvent) {
    const id = item.Id;
    console.log(id);
    if (item.StatusType == ApprovalStatusType.WaiteSubmit) {
      try {
        if (evt) {
          evt.stopPropagation();
        }
        this.router.navigate([AppHelper.getRoutePath("add-apply")], {
          queryParams: {
            id: id,
          },
        });
      } catch (e) {
        AppHelper.alert(e);
      }
    } else {
      this.router.navigate([AppHelper.getRoutePath("travel-apply-detail")], {
        queryParams: {
          id: id,
        },
      });
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
}
