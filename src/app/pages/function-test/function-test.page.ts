import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { Platform, IonApp, NavController } from "@ionic/angular";
import { FileHelperService } from "src/app/services/file-helper.service";
import { App } from "src/app/app.component";
import { LanguageHelper } from "src/app/languageHelper";
import { AppVersion } from "@ionic-native/app-version/ngx";
import { Ali } from "src/app/services/pay/pay.service";
import { FlightService } from "src/app/flight/flight.service";
import { MapPoint, MapService } from "src/app/services/map/map.service";
type Hcp = {
  openHcpPage: (url: string) => Promise<any>;
};

@Component({
  selector: "app-function-test",
  templateUrl: "./function-test.page.html",
  styleUrls: ["./function-test.page.scss"],
})
export class FunctionTestPage implements OnInit {
  posInfo: MapPoint;
  addressComponents: any;
  info: any = {};
  hcp: Hcp;
  curVersion: string;
  app: App;
  ali: Ali;
  showHcp: boolean = false;
  color: string;
  posList: any[];
  kw = "";
  bMapLocalSearch;
  colors = [
    "primary",
    "secondary",
    "tertiary",
    "warning",
    "mediun",
    "dark",
    "light",
    "danger",
  ];
  constructor(
    private fileService: FileHelperService,
    private flightService: FlightService,
    private navCtrl: NavController,
    private router: Router,
    private plt: Platform,
    private mapService: MapService
  ) {
    this.plt.ready().then(async () => {
      this.hcp = window["hcp"];
      this.app = navigator["app"];
      this.curVersion = fileService.getLocalHcpVersion();
      this.ali = window["ali"];
    });
  }
  back() {
    this.navCtrl.pop();
  }
  onPos() {
    this.mapService
      .getMyCurMapPoint()
      .then((r) => {
        this.posInfo = r;
      })
      .catch((e) => {
        console.error(e);
      });
  }
  onSearchPos() {
    this.mapService.onBMapLocalSearch(this.kw);
  }
  onGetInfoByLatlng() {
    this.mapService
      .getAddressComponents({ ...this.posInfo })
      .then((r) => {
        this.addressComponents = r;
      })
      .catch((e) => {
        console.error(e);
      });
  }
  showModal() {
    // this.router.navigate([AppHelper.getRoutePath('scan')]);
    this.showHcp = !this.showHcp;
  }
  async testHcp() {}
  ngOnInit() {
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.mapService.getBMapLocalSearchSources().subscribe((r) => {
      this.posList = r.map((it) => it.address);
    });
  }
  openSelectCityPage() {}
  alipay() {
    const payInfo = `app_id=2015052600090779&biz_content=%7B%22timeout_express%22%3A%2230m%22%2C%22seller_id%22%3A%22%22%2C%22product_code%22%3A%22QUICK_MSECURITY_PAY%22%2C%22total_amount%22%3A%220.02%22%2C%22subject%22%3A%221%22%2C%22body%22%3A%22%E6%88%91%E6%98%AF%E6%B5%8B%E8%AF%95%E6%95%B0%E6%8D%AE%22%2C%22out_trade_no%22%3A%22314VYGIAGG7ZOYY%22%7D&charset=utf-8&method=alipay.trade.app.pay&sign_type=RSA2&timestamp=2016-08-15%2012%3A12%3A15&version=1.0&sign=MsbylYkCzlfYLy9PeRwUUIg9nZPeN9SfXPNavUCroGKR5Kqvx0nEnd3eRmKxJuthNUx4ERCXe552EV9PfwexqW%2B1wbKOdYtDIb4%2B7PL3Pc94RZL0zKaWcaY3tSL89%2FuAVUsQuFqEJdhIukuKygrXucvejOUgTCfoUdwTi7z%2BZzQ%3D`;
    this.ali
      .pay(payInfo.trim())
      .then((res) => {
        console.log("支付结果，resultStatus = " + res.resultStatus);
        if (res.resultStatus == "9000") {
          AppHelper.alert("支付成功");
        } else {
          AppHelper.alert(
            "支付失败，" +
              JSON.stringify(res.result.alipay_trade_app_pay_response.sub_msg)
          );
        }
      })
      .catch((e) => {
        console.log("接口调用失败" + JSON.stringify(e, null, 2));
        AppHelper.alert(e);
      });
  }
}
