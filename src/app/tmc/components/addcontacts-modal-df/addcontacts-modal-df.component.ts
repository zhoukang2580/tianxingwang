import { Component, OnInit, ViewChild } from "@angular/core";
import { IonRefresher, ModalController } from "@ionic/angular";
import { TmcService } from "src/app/tmc/tmc.service";
interface OptionItem {
  Text: string;
  Value: string;
}
@Component({
  selector: "app-addcontacts-modal-df",
  templateUrl: "./addcontacts-modal-df.component.html",
  styleUrls: ["./addcontacts-modal-df.component.scss"],
})
export class AddcontactsModalDfComponent implements OnInit {
  private selectedOptionItem: OptionItem;
  items: OptionItem[];
  loading = false;
  vmKeyword = "";
  title: string;
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
    this.items = await this.tmcService.searchLinkman(this.vmKeyword);
  }
  onSelect(item: OptionItem) {
    this.selectedOptionItem = item;
    this.back();
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedOptionItem).catch((_) => {});
    }
  }
}
