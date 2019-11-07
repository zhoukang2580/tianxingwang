import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { ORDER_TABS } from "../product-tabs/product-tabs.page";
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.page.html",
  styleUrls: ["./product-list.page.scss"]
})
export class ProductListPage implements OnInit {
  products: ProductItem[] = [];
  constructor(
    route: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router
  ) {
    route.queryParamMap.subscribe(p => {
      this.products = ORDER_TABS;
      this.products = this.products.filter(
        t => t.value != ProductItemType.more && t.value != ProductItemType.insurance
      );
    });
  }
  back() {
    this.navCtrl.back();
  }
  goToProductTab(tab: ProductItem) {
    this.router.navigate([AppHelper.getRoutePath(`product-tabs`)], {
      queryParams: { tabId: tab.value }
    });
  }
  ngOnInit() { }
}
