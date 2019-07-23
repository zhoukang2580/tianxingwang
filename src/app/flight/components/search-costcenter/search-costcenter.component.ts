import { Component, OnInit, ViewChild } from "@angular/core";
import { IonRefresher, ModalController } from "@ionic/angular";
import { TmcService } from "src/app/tmc/tmc.service";
interface OptionItem {
  Text: string;
  Value: string;
}
@Component({
  selector: "app-search-costcenter",
  templateUrl: "./search-costcenter.component.html",
  styleUrls: ["./search-costcenter.component.scss"]
})
export class SearchCostcenterComponent implements OnInit {
  private selectedCostCenter: OptionItem;
  constCenters: OptionItem[];
  loading = false;
  vmKeyword = "";
  @ViewChild(IonRefresher) refresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private tmcService: TmcService
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
    this.constCenters = await this.tmcService.getCostCenter(this.vmKeyword);
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
