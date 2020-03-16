import { OrderStatusType } from "../../models/OrderEntity";
import { ModalController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { ProductItemType, ProductItem } from "../../../tmc/models/ProductItems";
import * as moment from "moment";
import { SearchTicketConditionModel } from "src/app/tmc/models/SearchTicketConditionModel";
import { SelectAirportsModalComponent } from "src/app/tmc/components/select-airports/select-airports.component";
@Component({
  selector: "app-search-ticket-modal",
  templateUrl: "./search-ticket-modal.component.html",
  styleUrls: ["./search-ticket-modal.component.scss"]
})
export class SearchTicketModalComponent implements OnInit {
  condition: SearchTicketConditionModel;
  type: number;
  title: string;
  orderStatus: { label: string; value: OrderStatusType }[] = [];
  constructor(private modalCtrl: ModalController) {}
  private async searchAirports(isFromCity = true) {
    const m = await this.modalCtrl.create({
      component: SelectAirportsModalComponent
    });
    await m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      if (isFromCity) {
        this.condition.fromCityName = result.data;
      } else {
        this.condition.toCityName = result.data;
      }
    }
  }
  async back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss(this.condition).catch(_ => null);
    }
  }
  search() {
    this.modalCtrl.getTop().then(t => {
      if (t) {
        this.condition.fromDate =
          (this.condition.vmFromDate &&
            moment(this.condition.vmFromDate, "YYYY-MM-DD").format(
              "YYYY-MM-DD"
            )) ||
          "";
        this.condition.toDate =
          (this.condition.vmToDate &&
            moment(this.condition.vmToDate, "YYYY-MM-DD").format(
              "YYYY-MM-DD"
            )) ||
          "";
        t.dismiss(this.condition).catch(_ => {});
      }
    });
  }
  ngOnInit() {
    if (!this.condition) {
      this.condition = new SearchTicketConditionModel();
    }
    this.orderStatus = [
      { label: "所有", value: "" as any },
      { label: "等待审核", value: OrderStatusType.WaitHandle },
      { label: "等待支付", value: OrderStatusType.WaitPay },
      { label: "完成", value: OrderStatusType.Finish },
      { label: "取消", value: OrderStatusType.Cancel }
    ];
    // this.condition.vmFromDate = moment()
    //   .startOf("year")
    //   .format("YYYY-MM-DD");
    console.log(this.condition);
  }
}
