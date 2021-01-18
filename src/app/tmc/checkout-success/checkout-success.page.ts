import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { HotelService } from 'src/app/hotel/hotel.service';
import { LangService } from 'src/app/services/lang.service';
import { ProductItemType } from 'src/app/tmc/models/ProductItems';
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';
import { TmcService } from 'src/app/tmc/tmc.service';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.page.html',
  styleUrls: ['./checkout-success.page.scss'],
})
export class CheckoutSuccessPage implements OnInit {
  private date;
  boutiqueHotel: {
    HotelDayPrices: {
      HotelFileName: string,
      HotelAddress: string,
      HotelName: string,
      Id: string,
      HotelCategory: string,
      Price: string
    }[],
    HotelDefaultImg: string
  };
  hothotels: {
    PageIndex: number,
    PageSize: number,
    CityCode: string,
    SearchDate: string
  };
  city: TrafficlineEntity;
  tabId;
  isApproval: boolean;
  isShow = true;
  payResult = false;
  constructor(
    private hotelService: HotelService,
    private router: Router,
    private langService: LangService,
    private tmcService: TmcService,
    private route: ActivatedRoute,
    private calendarService: CalendarService
  ) {

  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(async q => {
      this.tabId = q.get("tabId");
      if (q.get("cityCode")) {
        this.city = {} as any;
        this.city.CityCode = q.get("cityCode");
        this.isApproval= q.get("isApproval")=='true';
        this.payResult= q.get("payResult")=='true';
        this.city.Code = q.get("cityCode");
        this.city.CityName = q.get("cityName");
        this.city.Name = q.get("cityName");
        this.date = new Date().toLocaleDateString();
        if (q.get('date')) {
          this.date = q.get('date');
        }
        this.hothotels = {
          PageIndex: 0,
          PageSize: 20,
          CityCode: this.city && this.city.CityCode,
          SearchDate: this.date
        };
        const hasRight = await this.tmcService.checkHasHotelBookRight();
        if (hasRight) {
          this.getRecommendHotel();
        }
      }
    })
  }

  onMore() {
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      destinationCity: this.city,
      checkInDate: this.date,
      checkOutDate: this.calendarService.getMoment(1, this.date).format("YYYY-MM-DD")
    })
    this.router.navigate([AppHelper.getRoutePath("hotel-list")]);
  }
  private async getRecommendHotel() {
    this.tmcService
      .getRecommendHotel(this.hothotels)
      .catch(() => null)
      .then((res) => {
        this.boutiqueHotel = res;
      })
  }

  goToDetail(id) {
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      checkInDate: this.date,
      checkOutDate: this.calendarService.getMoment(1, this.date).format("YYYY-MM-DD")
    })
    this.router.navigate([AppHelper.getRoutePath("hotel-detail")],
      {
        queryParams: { hotelId: id },
      }
    );
  }

  // private goToMyOrders(tab: ProductItemType) {
  //   if (this.langService.isCn) {
  //     this.router.navigate(["order-list"], {
  //       queryParams: { tabId: tab },
  //     });
  //   } else {
  //     this.router.navigate(["order-list_en"], {
  //       queryParams: { tabId: tab },
  //     });
  //   }
  // }

  onOrderList() {
    this.router.navigate(["order-list"], {
      queryParams: { tabId: this.tabId },
    });
  }

}
