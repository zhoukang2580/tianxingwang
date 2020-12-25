import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LangService } from 'src/app/services/lang.service';
import { ProductItemType } from 'src/app/tmc/models/ProductItems';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.page.html',
  styleUrls: ['./checkout-success.page.scss'],
})
export class CheckoutSuccessPage implements OnInit {

  constructor(
    private router: Router,
    private langService: LangService
  ) {
    
  }

  ngOnInit() {

  }


  private async getBoutiqueHotel(){
    
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

  onClickList(tab: ProductItemType){
    if (this.langService.isCn) {
      this.router.navigate(["order-list"], {
        queryParams: { tabId: tab },
      });
    } else {
      this.router.navigate(["order-list_en"], {
        queryParams: { tabId: tab },
      });
    }
  }

}
