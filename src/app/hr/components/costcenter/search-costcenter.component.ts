import { Component, OnInit, ViewChild } from "@angular/core";
import { IonRefresher, ModalController, Platform } from "@ionic/angular";
import { HrService } from "../../hr.service";
interface OptionItem {
  Text: string;
  Value: string;
}
@Component({
  selector: "app-search-costcenter",
  templateUrl: "./search-costcenter.component.html",
  styleUrls: ["./search-costcenter.component.scss"],
})
export class CostcenterComponent implements OnInit {
  private selectedCostCenter: OptionItem;
  costCenters: OptionItem[];
  loading = false;
  vmKeyword = "";
  isIos = false;
  private hrId;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private hrService: HrService,
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
    this.costCenters = await this.hrService
      .getCostCenter({
        name: this.vmKeyword,
        hrId:this.hrId
      })
      .then((r) => {
        return r.map((it) => {
          return { Text: it.Name, Value: it.Id };
        });
      });
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
      t.dismiss(this.selectedCostCenter).catch((_) => {});
    }
  }
}
