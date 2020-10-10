import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { NavController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { ProductListPage } from '../product-list/product-list.page';

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list_en.page.html",
  styleUrls: ["./product-list_en.page.scss"]
})
export class ProductListEnPage extends ProductListPage {
 
}
