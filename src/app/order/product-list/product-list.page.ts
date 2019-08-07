import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { NavController } from "@ionic/angular";
import { AppHelper } from 'src/app/appHelper';
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.page.html",
  styleUrls: ["./product-list.page.scss"]
})
export class ProductListPage implements OnInit {
  products: ProductItem[] = [];
  constructor(route: ActivatedRoute, private navCtrl: NavController,private router:Router) {
    route.queryParamMap.subscribe(p => {
      if (p.get("tabs")) {
        this.products = JSON.parse(p.get("tabs"));
        this.products = this.products.filter(
          t => t.value != ProductItemType.more
        );
      }
    });
  }
  back() {
    this.navCtrl.back();
  }
  goToProductTab(tab: ProductItem) {
    this.router.navigate([AppHelper.getRoutePath(`product-tabs`)], {
      queryParams: { tabId: tab.value, tabs: JSON.stringify(this.products) }
    });
  }
  ngOnInit() {}
}
