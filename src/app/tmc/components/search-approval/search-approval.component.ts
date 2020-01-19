import { TmcService } from "src/app/tmc/tmc.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalController, IonRefresher } from "@ionic/angular";
export interface AppovalOption {
  Value: string;
  Text: string;
}
@Component({
  selector: "app-search-approval",
  templateUrl: "./search-approval.component.html",
  styleUrls: ["./search-approval.component.scss"]
})
export class SearchApprovalComponent implements OnInit {
  private selectedApproval: AppovalOption;
   approvals: AppovalOption[];
  loading = false;
  vmKeyword = "";
  @ViewChild(IonRefresher, { static: false }) refresher: IonRefresher;
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
    this.approvals = await this.tmcService.searchApprovals(this.vmKeyword);
  }
  onSelect(appoval: AppovalOption) {
    this.selectedApproval = appoval;
    this.back();
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedApproval).catch(_ => {});
    }
  }
}
