import { OrderStatusType } from "./../../../order/models/OrderEntity";
import { ModalController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { SelectTrainStationModalComponent } from "../select-stations/select-station.component";
import { SelectAirportsModalComponent } from "../select-airports/select-airports.component";
import { SearchTicketConditionModel } from "../../models/SearchTicketConditionModel";
import { ProductItemType, ProductItem } from "../../models/ProductItems";
import * as moment from "moment";
@Component({
  selector: "app-search-ticket-modal",
  templateUrl: "./search-ticket-modal.component.html",
  styleUrls: ["./search-ticket-modal.component.scss"]
})
export class SearchTicketModalComponent implements OnInit {
  condition: SearchTicketConditionModel = new SearchTicketConditionModel();
  type: ProductItem;
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
        this.condition.fromCity = result.data;
      } else {
        this.condition.toCity = result.data;
      }
    }
  }
  async searchCities(isFromCity = true) {
    if (this.type.value == ProductItemType.plane) {
      await this.searchAirports(isFromCity);
    }
    if (this.type.value == ProductItemType.train) {
      await this.searchTrainStations(isFromCity);
    }
  }
  private async searchTrainStations(isFromCity = true) {
    const m = await this.modalCtrl.create({
      component: SelectTrainStationModalComponent
    });
    await m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      if (isFromCity) {
        this.condition.fromCity = result.data;
      } else {
        this.condition.toCity = result.data;
      }
    }
  }
  search() {
    this.modalCtrl.getTop().then(t => {
      if (t) {
        this.condition.fromDate =
          (this.condition.vmFromDate &&
            moment(this.condition.vmFromDate).format("YYYY-MM-DD")) ||
          "";
        this.condition.toDate =
          (this.condition.vmToDate &&
            moment(this.condition.vmToDate).format("YYYY-MM-DD")) ||
          "";
        t.dismiss(this.condition).catch(_ => {});
      }
    });
  }
  ngOnInit() {
    this.orderStatus = [
      { label: "所有", value: "" as any },
      { label: "等待审核", value: OrderStatusType.WaitHandle },
      { label: "等待支付", value: OrderStatusType.WaitPay },
      { label: "完成", value: OrderStatusType.Finish },
      { label: "取消", value: OrderStatusType.Cancel }
    ];
    this.condition.vmFromDate = moment()
      .startOf("year")
      .format("YYYY/MM/DD");
    console.log(this.condition);
  }
}
