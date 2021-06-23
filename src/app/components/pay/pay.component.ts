import { LanguageHelper } from "src/app/languageHelper";
import { AppHelper } from "src/app/appHelper";
import { PopoverController, Platform } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
export interface IPayWayItem {
  label: string;
  value: string;
  isChecked?: boolean;
}
@Component({
  selector: "app-pay-comp",
  templateUrl: "./pay.component.html",
  styleUrls: ["./pay.component.scss"],
})
export class PayComponent implements OnInit {
  payWays: IPayWayItem[];
  isIos = false;
  constructor(private popoverController: PopoverController, plt: Platform) {
    this.isIos = plt.is("ios");
  }
  async onSelectPayWay(payWay: IPayWayItem) {
    this.payWays = this.payWays.map((it) => {
      it.isChecked = it.value == payWay.value;
      return it;
    });
  }
  async onDone() {
    this.back();
  }
  async onCancel() {
    if (this.payWays) {
      this.payWays.forEach((it) => {
        it.isChecked = false;
      });
    }
    this.back();
  }
  async back() {
    const t = await this.popoverController.getTop();
    if (t) {
      t.dismiss(this.payWays && this.payWays.find((it) => it.isChecked)).catch(
        (_) => 0
      );
    }
  }
  ngOnInit() {
    if (!this.payWays) {
      this.payWays = [];
    }
    if (AppHelper.isApp() || AppHelper.isH5()) {
      this.payWays.push({
        label: LanguageHelper.PayWays.getAliPayTip(),
        value: "ali",
      });
      this.payWays.push({
        label: LanguageHelper.PayWays.getWechatPayTip(),
        value: "wechat",
      });
    }
    if (AppHelper.isDingtalkH5()) {
      this.payWays.push({
        label: LanguageHelper.PayWays.getAliPayTip(),
        value: "ali",
      });
    }
    if (AppHelper.isWechatH5() || AppHelper.isWechatMini()) {
      this.payWays.push({
        label: LanguageHelper.PayWays.getWechatPayTip(),
        value: "wechat",
      });
    }
    if (AppHelper.isWechatH5() || AppHelper.isWechatMini()) {
      this.payWays = this.payWays.filter(
        (it) =>
          !(
            it.label.includes("支付宝") ||
            it.value.toLowerCase().includes("ali")
          )
      );
    }
    if (AppHelper.isDingtalkH5()) {
      this.payWays = this.payWays.filter(
        (it) =>
          !(
            it.label.includes("微信") ||
            it.value.includes("weixin") ||
            it.value.includes("wechat")
          )
      );
    }
    if (this.payWays && this.payWays.length) {
      this.payWays[0].isChecked = true;
    }
  }
}
