import { LangService } from "src/app/services/lang.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
export const ORDER_TABS: ProductItem[] = [
  {
    label: "机票",
    value: ProductItemType.plane,
    labelEn: "Flight",
    // product-plane
    imageSrc: "assets/svgs/product-plane1.svg",
    isDisplay: true,
  },
  {
    label: "酒店",
    labelEn: "Hotel",
    value: ProductItemType.hotel,
    // product-hotel
    imageSrc: "assets/svgs/product-hotel1.svg",
    isDisplay: true,
  },
  {
    label: "火车票",
    labelEn: "Train",
    value: ProductItemType.train,
    imageSrc: "assets/svgs/product-train1.svg",
    isDisplay: true,
  },
  {
    label: "用车",
    labelEn: "Car",
    value: ProductItemType.car,
    imageSrc: "assets/svgs/product-retalCar1.svg",
    isDisplay: true,
  },
  {
    label: "保险",
    labelEn: "Insurance",
    value: ProductItemType.insurance,
    imageSrc: "assets/svgs/product-insurance.svg",
    isDisplay: !true,
  },
]
@Component({
  selector: "app-product-list_df",
  templateUrl: "./product-list_df.page.html",
  styleUrls: ["./product-list_df.page.scss"],
})
export class ProductListDfPage implements OnInit {
  products: ProductItem[] = [];
  constructor(
    route: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private langService: LangService
  ) {
    route.queryParamMap.subscribe((p) => {
      this.products = ORDER_TABS;
      this.products = this.products.filter(
        (t) =>
          t.value != ProductItemType.more &&
          t.value != ProductItemType.insurance
      );
    });
  }
  back() {
    this.navCtrl.pop();
  }
  goToProductTab(tab: ProductItem) {
    this.router.navigate([AppHelper.getRoutePath(`order-list_df`)], {
      queryParams: { tabId: tab.value },
    });
  }
  ngOnInit() {}
}
