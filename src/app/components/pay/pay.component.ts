import { LanguageHelper } from "src/app/languageHelper";
import { AppHelper } from "src/app/appHelper";
import { PopoverController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
export interface IPayWayItem {
  label: string;
  value: "ali" | "wechat";
  isChecked?: boolean;
}
@Component({
  selector: "app-pay-comp",
  templateUrl: "./pay.component.html",
  styleUrls: ["./pay.component.scss"]
})
export class PayComponent implements OnInit {
  payWays: IPayWayItem[];
  constructor(private popoverController: PopoverController) {}
  async onSelectPayWay(payWay: IPayWayItem) {
    this.payWays.forEach(it => {
      it.isChecked = it.value == payWay.value;
    });
  }
  async onDone() {
    this.onCandel();
  }
  async onCandel() {
    const t = await this.popoverController.getTop();
    if (t) {
      t.dismiss(this.payWays.find(it => it.isChecked)).catch(_ => 0);
    }
  }
  ngOnInit() {
    if (AppHelper.isApp()) {
      this.payWays = [];
      this.payWays.push({
        label: LanguageHelper.PayWays.getAliPayTip(),
        value: "ali"
      });
      this.payWays.push({
        label: LanguageHelper.PayWays.getWechatPayTip(),
        value: "wechat"
      });
    }
    if (AppHelper.isDingtalkH5()) {
      this.payWays = [
        {
          label: LanguageHelper.PayWays.getAliPayTip(),
          value: "ali"
        }
      ];
    }
    if (AppHelper.isWechatH5() || AppHelper.isWechatMini()) {
      this.payWays = [
        {
          label: LanguageHelper.PayWays.getAliPayTip(),
          value: "wechat"
        }
      ];
    }
    if (
      (!this.payWays || this.payWays.length === 0) &&
      !environment.production
    ) {
      this.payWays = [];
      this.payWays.push({
        label: LanguageHelper.PayWays.getAliPayTip(),
        value: "ali"
      });
      this.payWays.push({
        label: LanguageHelper.PayWays.getWechatPayTip(),
        value: "wechat"
      });
    }
    if (this.payWays && this.payWays.length) {
      this.payWays[0].isChecked = true;
    }
  }
}
