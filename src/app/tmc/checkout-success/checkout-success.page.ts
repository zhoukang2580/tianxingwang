import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { HotelService } from "src/app/hotel/hotel.service";
import { LangService } from "src/app/services/lang.service";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { TmcService } from "src/app/tmc/tmc.service";
import { CalendarService } from "../calendar.service";

@Component({
  selector: "app-checkout-success",
  templateUrl: "./checkout-success.page.html",
  styleUrls: ["./checkout-success.page.scss"],
})
export class CheckoutSuccessPage implements OnInit, CanComponentDeactivate {
  private date;
  boutiqueHotel: {
    HotelDayPrices: {
      HotelFileName: string;
      HotelAddress: string;
      HotelName: string;
      Id: string;
      HotelCategory: string;
      Price: string;
    }[];
    HotelDefaultImg: string;
  };
  hothotels: {
    PageIndex: number;
    PageSize: number;
    CityCode: string;
    SearchDate: string;
  };
  city: TrafficlineEntity;
  tabId;
  isShow = true;
  showTipMsg = "";
  private isApproval: boolean;
  private isCheckPay = true;
  private payResult = false;
  private isCanBack = false;
  private recommendHotelDefaultImg;
  constructor(
    private hotelService: HotelService,
    private router: Router,
    private langService: LangService,
    private tmcService: TmcService,
    private route: ActivatedRoute,
    private calendarService: CalendarService
  ) {}
  private initShowTipMsg() {
    this.showTipMsg = "";
    if (this.isApproval) {// 需要审批
      this.showTipMsg = "您的订单需要审批，稍后请至订单列表查询";
      if (this.isCheckPay) {
        if (!this.payResult) {
          this.showTipMsg =
            "您的订单需要审批，请于审批完成后到订单列表进行支付";
        }
      }
    } else {// 不需要审批
      if (this.isCheckPay) {//需要支付
        if (!this.payResult) {
          // 未支付成功
          this.showTipMsg = "您的订单尚未支付，请您稍后到订单列表进行支付";
        }else{
          //支付成功
          this.showTipMsg = "您的订单正在预订，稍后请至订单列表查询";
        }
      } else {
        // 不需要支付
        this.showTipMsg = "您的订单正在预订，稍后请至订单列表查询";
      }
    }
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(async (q) => {
      this.tabId = q.get("tabId");
      this.isApproval = q.get("isApproval") == "true";
      this.isCheckPay = q.get("isCheckPay") == "true";
      this.payResult = q.get("payResult") == "true";
      this.initShowTipMsg();
      const hasRight = await this.tmcService.checkHasHotelBookRight();
      console.log(q, "hasright", hasRight);
      if (q.get("cityCode")) {
        this.city = {} as any;
        this.city.CityCode = q.get("cityCode");
        this.city.Code = q.get("cityCode");
        this.city.CityName = q.get("cityName");
        this.city.Name = q.get("cityName");
        this.date = new Date().toLocaleDateString();
        if (q.get("date")) {
          this.date = q.get("date");
        }
        this.hothotels = {
          PageIndex: 0,
          PageSize: 20,
          CityCode: this.city && this.city.CityCode,
          SearchDate: this.date,
        };
        if (hasRight) {
          this.getRecommendHotel();
        }
      }
    });
  }
  canDeactivate() {
    if (this.isCanBack) {
      return true;
    }
    // this.onOrderList();
    return false;
  }
  onMore() {
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      destinationCity: this.city,
      checkInDate: this.date,
      checkOutDate: this.calendarService
        .getMoment(1, this.date)
        .format("YYYY-MM-DD"),
    });
    this.isCanBack = true;
    this.router.navigate(["hotel-list"]);
  }
  private async getRecommendHotel() {
    this.tmcService
      .getRecommendHotel(this.hothotels)
      .catch(() => null)
      .then((res) => {
        this.recommendHotelDefaultImg = res && res.HotelDefaultImg;
        this.boutiqueHotel = res;
      });
  }

  goToDetail(id) {
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      checkInDate: this.date,
      checkOutDate: this.calendarService
        .getMoment(1, this.date)
        .format("YYYY-MM-DD"),
    });
    this.isCanBack = true;
    this.hotelService.RoomDefaultImg = this.recommendHotelDefaultImg;
    this.router.navigate([AppHelper.getRoutePath("hotel-detail")], {
      queryParams: { hotelId: id },
    });
  }

  onOrderList() {
    this.isCanBack = true;
    this.router.navigate(["order-list"], {
      queryParams: { tabId: this.tabId },
    });
  }
}
