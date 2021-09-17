import { ApiService } from "src/app/services/api/api.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { ModalController } from "@ionic/angular";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { Component, OnInit } from "@angular/core";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
import { IdentityService } from "src/app/services/identity/identity.service";
import { Router } from '@angular/router';
import { InsurancOpenUrlComponent } from '../insuranc-open-url/insuranc-open-url.component';
import { OrderService } from "src/app/order/order.service";

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
    private tmcService: TmcService,
    private router: Router,
    private orderService:OrderService
  ) {}
  back() {
    this.modalCtrl.getTop().then(t => t.dismiss());
  }
  async onShowProductDetail(insurance: InsuranceProductEntity, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (!insurance || !insurance.DetailUrl) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: InsurancOpenUrlComponent,
      componentProps: {
        url: insurance.DetailUrl,
        title: insurance.Name
      },
    });
    m.present();
    await m.onDidDismiss();
    // this.router.navigate([AppHelper.getRoutePath("open-url")], {
    //   queryParams: { url: insurance.DetailUrl, title: insurance.Name },
    // });
  }
  ngOnInit() {}
  async payInsurance(key: string, tradeNo: string, evt?: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (key && tradeNo) {
      // await this.tmcService.payOrder(tradeNo, key);
      await this.orderService.payOrder(tradeNo, key, false, this.tmcService.getQuickexpressPayWay());
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
      PassagerId: trip.Passenger&&trip.Passenger.Id,
      Channel: channel
    };
    req.IsShowLoading = true;
    const order: {
      TradeNo: string;
      Key: string;
    } = await this.apiservice.getPromiseData<any>(req).catch(r => {
      AppHelper.alert(r&&r.Message || r||"接口异常");
      return null;
    });
    if (order) {
      await this.payInsurance(order.Key, order.TradeNo);
      this.back();
    }
  }
}
