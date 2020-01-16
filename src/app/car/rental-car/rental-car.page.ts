import { AppHelper } from "./../../appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { TmcService } from "./../../tmc/tmc.service";
import { NavController } from "@ionic/angular";
import { CarService } from "./../car.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-rental-car",
  templateUrl: "./rental-car.page.html",
  styleUrls: ["./rental-car.page.scss"]
})
export class RentalCarPage implements OnInit {
  mobile: string;
  constructor(
    private carService: CarService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  back() {
    this.navCtrl.back();
  }
  async onRentalCar() {
    if (!this.mobile) {
      AppHelper.alert("请输入手机号");
      return;
    }
    const url = await this.carService.verifyStaff({ Mobile: this.mobile });
    if (url) {
      this.router.navigate(["open-url"], {
        queryParams: {
          url,
          title: "租车",
          isHideTitle: AppHelper.isDingtalkH5() || AppHelper.isWechatH5()
        }
      });
    }
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.getAccountInfo();
    });
  }
  private async getAccountInfo() {
    const info = await this.carService
      .getAccountInfo()
      .catch(_ => ({ Mobile: "" }));
    if (info) {
      this.mobile = info.Mobile;
    }
  }
}
