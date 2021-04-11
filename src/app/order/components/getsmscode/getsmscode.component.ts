import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { OrderService } from "../../order.service";

@Component({
  selector: "app-getsmscode",
  templateUrl: "./getsmscode.component.html",
  styleUrls: ["./getsmscode.component.scss"],
})
export class GetsmscodeComponent implements OnInit {
  mobile: string;
  smsCode: string;
  private orderHotelId: string;
  constructor(
    private orderService: OrderService,
    private popController: PopoverController
  ) {}

  ngOnInit() {}
  onGetSmsCode() {
    if (!this.mobile) {
      AppHelper.alert("请输入手机号");
      return;
    }
    this.orderService
      .onGetVerifySMSCode({
        OrderHotelId: this.orderHotelId,
        Mobile: this.mobile,
      })
      .then((r) => {
        AppHelper.alert(r);
      })
      .catch((e) => {
        AppHelper.alert(e);
      });
  }
  onOk() {
    if (!this.smsCode) {
      AppHelper.alert("请输入验证码");
      return;
    }
    this.popController.getTop().then((t) => {
      if (t) {
        t.dismiss({ mobile: this.mobile, smsCode: this.smsCode });
      }
    });
  }
  onCancel() {
    this.popController.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
}
