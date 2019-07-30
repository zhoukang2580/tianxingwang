import { ActivatedRoute } from "@angular/router";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { NavController, ModalController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { SearchTicketModalComponent } from "../components/search-ticket-modal/search-ticket-modal.component";
import { SearchTicketConditionModel } from "../models/SearchTicketConditionModel";
import { ProductItemType, ProductItem } from "../models/ProductItems";

@Component({
  selector: "app-product-tabs",
  templateUrl: "./product-tabs.page.html",
  styleUrls: ["./product-tabs.page.scss"]
})
export class ProductTabsPage implements OnInit {
  private condition: SearchTicketConditionModel;
  activeTab: ProductItemType;
  tabs: ProductItem[] = [];
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe(d => {
      console.log("product-tabs", d);
      if (d && d.get("tabId")) {
        this.activeTab = +d.get("tabId") || ProductItemType.plane;
      }
      if (d && d.get("tabs")) {
        this.tabs = JSON.parse(d.get("tabs"));
        this.tabs = this.tabs.filter(t => t.value != ProductItemType.more);
      }
    });
  }
  onTabClick(tab: ProductItem) {
    this.activeTab = tab.value;
  }
  back() {
    this.navCtrl.back();
  }
  async openSearchModal() {
    const m = await this.modalCtrl.create({
      component: SearchTicketModalComponent,
      componentProps:{
        type:this.activeTab
      }
    });
    await m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      this.condition = { ...this.condition, ...result.data };
    }
  }
  private async doSearch() {}
  ngOnInit() {}
}
