import { Component, OnInit, ViewChild } from "@angular/core";
import { IonRefresher, ModalController } from "@ionic/angular";
import { TmcService } from "src/app/tmc/tmc.service";
import { RefresherComponent } from "src/app/components/refresher";
interface OptionItem {
  Text: string;
  Value: string;
}
@Component({
  selector: "app-search-costcenter",
  templateUrl: "./search-costcenter.component.html",
  styleUrls: ["./search-costcenter.component.scss"],
})
export class SearchCostcenterComponent implements OnInit {
  private selectedCostCenter: OptionItem;
  constCenters: OptionItem[];
  loading = false;
  vmKeyword = "";
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  constructor(
    private modalCtrl: ModalController,
    private tmcService: TmcService
  ) {}

  ngOnInit() {}
  doRefresh() {
    this.vmKeyword = "";
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  async doSearch() {
    this.loading = true;
    await this.loadMore();
    this.loading = false;
    if (this.refresher) {
      this.refresher.complete();
    }
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
      t.dismiss(this.selectedCostCenter).catch((_) => {});
    }
  }
}
