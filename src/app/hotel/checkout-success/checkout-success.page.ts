import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { LangService } from 'src/app/services/lang.service';
import { ProductItemType } from 'src/app/tmc/models/ProductItems';
import { TmcService } from 'src/app/tmc/tmc.service';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.page.html',
  styleUrls: ['./checkout-success.page.scss'],
})
export class CheckoutSuccessPage implements OnInit {
  boutiqueHotel:{
    HotelDayPrices:{
      HotelFileName: string,
      HotelAddress: string,
      HotelName: string,
      Id:string,
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
  constructor(
    private router: Router,
    private langService: LangService,
    private tmcService: TmcService
  ) {
    
  }

  ngOnInit() {
    var myDate = new Date();
    this.hothotels = {
      PageIndex: 0,
      PageSize: 20,
      CityCode: "3101",
      SearchDate: myDate.toLocaleDateString()
    };
    this.getBoutiqueHotel();
  }


  private async getBoutiqueHotel(){
    if (!this.boutiqueHotel || !this.boutiqueHotel.HotelDayPrices||!this.boutiqueHotel.HotelDayPrices.length) {
      await this.tmcService
      .getBoutique(this.hothotels)
      .catch(() => null)
      .then((res) => {
        this.boutiqueHotel = res;
      })
    }
  }

  goToDetail(id) {
    this.router.navigate([AppHelper.getRoutePath("hotel-detail")],
    {
      queryParams: { hotelId: id},
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

  onClickList(){
    this.router.navigate(["order-list"], {
      queryParams: { tabId: ProductItemType.hotel },
    });
  }

}
