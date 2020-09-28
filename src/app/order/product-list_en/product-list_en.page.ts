import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { ProductListPage } from '../product-list/product-list.page';
export const ORDER_TABS: ProductItem[] = [
  {
    label: "Plane",
    value: ProductItemType.plane,
    // product-plane
    imageSrc: "assets/svgs/product-plane1.svg",
    isDisplay: true
  },
  {
    label: "Hotel",
    value: ProductItemType.hotel,
    // product-hotel
    imageSrc: "assets/svgs/product-hotel1.svg",
    isDisplay: true
  },
  {
    label: "Train",
    value: ProductItemType.train,
    imageSrc: "assets/svgs/product-train1.svg",
    isDisplay: true
  }
  ,
  {
    label: "Car",
    value: ProductItemType.car,
    imageSrc: "assets/svgs/product-retalCar1.svg",
    isDisplay: true
  },
  {
    label: "保险",
    value: ProductItemType.insurance,
    imageSrc: "assets/svgs/product-insurance.svg",
    isDisplay: !true
  },
 
];
@Component({
  selector: "app-product-list",
  templateUrl: "./product-list_en.page.html",
  styleUrls: ["./product-list_en.page.scss"]
})
export class ProductListEnPage extends ProductListPage {
 
}
