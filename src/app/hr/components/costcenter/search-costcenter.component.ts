import { TmcService } from "src/app/tmc/tmc.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { IonRefresher, ModalController, Platform } from "@ionic/angular";
interface OptionItem {
  Text: string;
  Value: string;
}
@Component({
  selector: "app-search-costcenter",
  templateUrl: "./search-costcenter.component.html",
  styleUrls: ["./search-costcenter.component.scss"]
})
export class CostcenterComponent implements OnInit {
  private selectedCostCenter: OptionItem;
  constCenters: OptionItem[];
  loading = false;
  vmKeyword = "";
  isIos = false;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private tmcService: TmcService,
    private plt: Platform
  ) {
    this.isIos = plt.is("ios");
  }

  ngOnInit() {}
  doRefresh() {
    this.vmKeyword = "";
  }
  async doSearch() {
    this.loading = true;
    await this.loadMore();
    this.loading = false;
  }
  private async loadMore() {
    this.constCenters = await this.tmcService.getCostCenter(this.vmKeyword);
  }
  onSelect(item: OptionItem) {
    this.selectedCostCenter = item;
    this.back();
  }
  async back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedCostCenter).catch(_ => {});
    }
  }
}
