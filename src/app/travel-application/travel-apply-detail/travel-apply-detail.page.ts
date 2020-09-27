import { Router } from "@angular/router";
import { TaskStatusType } from "./../../workflow/models/TaskStatusType";
import { async } from "@angular/core/testing";
import { Component, OnInit, OnDestroy, Input, OnChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import {
  TravelService,
  SearchModel,
  ApprovalStatusType,
} from "../travel.service";
import { AppHelper } from "src/app/appHelper";
import { TmcService } from "src/app/tmc/tmc.service";

@Component({
  selector: "app-travel-apply-detail",
  templateUrl: "./travel-apply-detail.page.html",
  styleUrls: ["./travel-apply-detail.page.scss"],
})
export class TravelApplyDetailPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  detail: SearchModel;
  // tslint:disable-next-line: ban-types
  isflag: Boolean = true;
  ApprovalStatusType = ApprovalStatusType;
  istime: Boolean = true;
  Property: any;
  remark: any;
  taskStatus: TaskStatusType;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tmcService: TmcService,
    private service: TravelService
  ) {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe((q) => {
      if (q.get("id")) {
        this.getDetail(q.get("id"));
      }
    });
  }
  private replaceTime(datetime: string) {
    if (datetime) {
      return datetime.substr(0, 10).replace(/-/g, ".").replace(/:/g, ".");
    }
    return "";
  }
  private initTrips() {
    if (this.detail && this.detail.TravelForm && this.detail.TravelForm.Trips) {
      this.detail.TravelForm.Trips.forEach((trip) => {
        trip.StartDate = this.replaceTime(trip.StartDate);
        trip.EndDate = this.replaceTime(trip.EndDate);
        if (trip.FromCityName) {
          trip.FromCityName = trip.FromCityName.replace(/,/g, "·");
        }
        if (trip.ToCityName) {
          trip.ToCityName = trip.ToCityName.replace(/,/g, "·");
        }
        if (trip.TravelTool) {
          const tools = trip.TravelTool.split(","); // ['Flight']
          trip["hasFlight"] = tools.some((it) => it.toLowerCase() == "flight");
          trip["hasHotel"] = tools.some((it) => it.toLowerCase() == "hotel");
          trip["hasTrain"] = tools.some((it) => it.toLowerCase() == "train");
        }
      });
    }
  }

  private getColor(taskStatus) {
    let color = "";
    if (taskStatus == TaskStatusType.Created) {
      color = "orange";
    } else if (taskStatus == TaskStatusType.Waiting) {
      color = "blue";
    } else if (taskStatus == TaskStatusType.Passed) {
      color = "red";
    } else {
      color = "blue";
    }
    return color;
  }

  private initTime() {
    if (this.detail && this.detail.TravelForm) {
      const date = this.detail.TravelForm.ApplyTime.substr(0, 10).replace(
        /-/g,
        "."
      );
      const time = this.detail.TravelForm.ApplyTime.substr(10, 6).replace(
        /T/g,
        " "
      ); // 2020-09-10T12:40:34
      const appdate = this.detail.TravelForm.ApprovalTime.substr(0, 10).replace(
        /-/g,
        "."
      );
      this.detail.TravelForm.applyTimeDate = date;
      this.detail.TravelForm.applyTimeTime = time;
      this.detail.TravelForm.approvalTimeDate = appdate;
    }
  }

  private async getDetail(id: string) {
    this.detail = await this.service.getTravelDetail(id).catch(() => null);
    this.initTrips();
    this.initTime();
    if (this.detail && this.detail.Histories) {
      for (var i = 0; i < this.detail.Histories.length; i++) {
        if (this.detail.Histories[i].Status == TaskStatusType.Rejected) {
          this.remark = this.detail.Histories[i].Remark;
          break;
        }
      }
    }
  }
  onToggle(trip: any) {
    trip.isHideButtons = !trip.isHideButtons;
  }

  async goToPage(name: string, params?: any) {
    const tmc = await this.tmcService.getTmc();
    const msg = "您没有预订权限";
    if (!tmc || !tmc.RegionTypeValue) {
      AppHelper.alert(msg);
      return;
    }
    let route = "";

    const tmcRegionTypeValue = tmc.RegionTypeValue.toLowerCase();
    if (name == "international-flight") {
      route = "search-international-flight";
      if (tmcRegionTypeValue.search("internationalflight") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "international-hotel") {
      route = "search-international-hotel";
      if (tmcRegionTypeValue.search("internationalhot") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "hotel") {
      route = "search-hotel";
      if (tmcRegionTypeValue.search("hotel") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "train") {
      route = "search-train";
      if (tmcRegionTypeValue.search("train") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "flight") {
      route = "search-flight";
      if (tmcRegionTypeValue.search("flight") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "rentalCar") {
      route = "rental-car";
      if (tmcRegionTypeValue.search("car") < 0) {
        AppHelper.alert(msg);
        return;
      }
    }
    if (name == "bulletin") {
      route = "bulletin-list";
    }
    this.tmcService.setTravelFormNumber(this.detail.TravelForm.Id);
    this.router.navigate([AppHelper.getRoutePath(route)], {
      queryParams: { bulletinType: params },
    });
  }
}
