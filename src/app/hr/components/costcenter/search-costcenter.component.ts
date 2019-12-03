import { Component, OnInit, ViewChild } from "@angular/core";
import { IonRefresher, ModalController } from "@ionic/angular";
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
  @ViewChild(IonRefresher) refresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
  ) {}

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
    this.constCenters = [];
  }
  onSelect(item: OptionItem) {
    this.selectedCostCenter = item;
    this.back();
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedCostCenter).catch(_ => {});
    }
  }
}
