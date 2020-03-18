import { ApiService } from "src/app/services/api/api.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { ModalController } from "@ionic/angular";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { Component, OnInit } from "@angular/core";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
import { IdentityService } from "src/app/services/identity/identity.service";

@Component({
  selector: "app-trip-buy-insurance",
  templateUrl: "./trip-buy-insurance.component.html",
  styleUrls: ["./trip-buy-insurance.component.scss"]
})
export class TripBuyInsuranceComponent implements OnInit {
  insurance: InsuranceProductEntity;
  trip: OrderTripModel;
  constructor(
    private modalCtrl: ModalController,
    private apiservice: ApiService,
    private identityService: IdentityService,
    private tmcService: TmcService
  ) {}
  back() {
    this.modalCtrl.getTop().then(t => t.dismiss());
  }
  ngOnInit() {}
  async payInsurance(key: string, tradeNo: string, evt?: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (key && tradeNo) {
      await this.tmcService.payOrder(tradeNo, key);
    }
  }
  async bookInsurance() {
    const trip = this.trip;
    if (!this.insurance || !trip) {
      return;
    }
    let channel = "客户H5";
    channel = await this.tmcService.getChannel();
    const req = new RequestEntity();
    req.Method = `TmcApiOrderUrl-Insurance-Book`;
    req.Data = {
      key: trip.AdditionKey,
      travelkey: trip.Key,
      OrderId: trip.OrderId,
      Product: JSON.stringify(this.insurance),
      PassagerId: trip.PassengerId,
      Channel: channel
    };
    req.IsShowLoading = true;
    const order: {
      TradeNo: string;
      Key: string;
    } = await this.apiservice.getPromiseData<any>(req).catch(_ => {
      AppHelper.alert(_.Message || _);
      return null;
    });
    if (order) {
      await this.payInsurance(order.Key, order.TradeNo);
      this.back();
    }
  }
}
