import { Component, OnInit } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { TrainService } from "../../train.service";

@Component({
  selector: "app-validate12306",
  templateUrl: "./validate12306.component.html",
  styleUrls: ["./validate12306.component.scss"],
})
export class Validate12306Component implements OnInit {
  constructor(private trainService: TrainService) {}
  name: string;
  password: string;
  code: string;
  isAgreement = true;
  isShowAgreement = false;
  bindAccountNumber: { Name: string; Number: string };
  countDown = 0;
  isNamePasswordValidateFail = false;
  passengersList: any;
  isSendSms = false;
  accountNumber = {
    SmsTip: "",
    SendSmsBody: "666",
  };
  validateResult = false;
  ngOnInit() {
    this.getBindAccountNumber();
  }
  back() {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        const res = this.validateResult
          ? {
              Name: this.name,
              Number: this.password,
            }
          : false;
        t.dismiss(res);
      }
    });
  }
  onSendSms() {
    const a = document.createElement("a");
    a.href = `sms:12306${AppHelper.platform.is("ios") ? "&" : "?"}body=666`;
    a.click();
    this.isSendSms = true;
  }
  onOpen12306Items(url: string) {
    AppHelper.jump(AppHelper.Router, url, { isBlank: true });
  }
  onToggleIsRead() {
    this.isAgreement = !this.isAgreement;
  }
  onRead() {
    this.isAgreement = true;
  }
  private async getContacts() {
    this.trainService.getContacts().then((r) => {
      if (r && r.PassengersList) {
        const passengersList = JSON.parse(r.PassengersList);
        this.passengersList = passengersList;
      }
    });
  }
  openAgreementPage(event: CustomEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isShowAgreement = true;
  }
  async onUnbind() {
    try {
      await this.trainService.Unbind12306();
      this.bindAccountNumber = null;
      this.name = "";
      this.password = "";
      // const r = await this.validateAccount();
      // if (r) {
      //   await this.trainService.Unbind12306();
      //   AppHelper.alert("退出登录成功");
      // }
    } catch (e) {
      console.error(e);
      AppHelper.alert(e || "退出登录失败");
    }
  }
  private async validateAccount() {
    try {
      const r = await this.trainService.accountValidate({
        name: this.name,
        password: this.password,
        code: this.code,
      });
      if (r.Status) {
        return true;
      } else {
        if (r.Message) {
          AppHelper.alert(r.Message);
        }
      }
    } catch (e) {
      AppHelper.alert(e);
    }
    return false;
  }
  private async getBindAccountNumber() {
    try {
      this.bindAccountNumber = await this.trainService.getBindAccountNumber();
      if (this.bindAccountNumber) {
        this.password = this.bindAccountNumber.Number;
        this.name = this.bindAccountNumber.Name;
      }
    } catch (e) {
      // AppHelper.alert(e);
      console.error(e);
    }
    return false;
  }
  async codeValidateAndBind12306() {
    try {
      // const ok = await this.validateAccount();
      const r = await this.trainService.codeValidateAndBind12306({
        name: this.name,
        password: this.password,
        code: this.code,
      });
      this.validateResult = r.Status;
      if (!this.validateResult) {
        if (r.Message) {
          AppHelper.alert(r.Message);
        }
      } else {
        this.back();
      }
    } catch (e) {
      console.error(e);
      AppHelper.alert(e || "接口异常");
    }
  }
  async onBind() {
    try {
      const ok = true; // await this.validateAccount();
      if (ok) {
        const r = await this.trainService.bind12306({
          name: this.name,
          password: this.password,
        });
        this.validateResult = r.Status;
        if (r.Status) {
          // await this.getContacts();
          this.back();
          return;
        }
        if (r.Code == "TrainCheckPassenger") {
          this.isNamePasswordValidateFail = true;
          const arr = r.Message.split("/");
          if (arr.length > 1) {
            let p = arr[0];
            if (!p.includes("*") && p.length >= 11) {
              p = `${p.substr(0, 3)}****${p.substr(7, 4)}`;
            }
            this.accountNumber.SmsTip = `请您用手机尾号${p.substr(
              7,
              4
            )}发送短信666至12306`;
          }
          this.accountNumber.SendSmsBody = arr[1] || "666";
        }
        if (r.Code == "MessageCodeValidate") {
          // 该账号需要手机发短信核验_请您用手机尾号2136发送短信666至12306或人脸核验
          if (r.Message.includes("发送短信666至12306")) {
            this.isNamePasswordValidateFail = true;
            this.accountNumber.SmsTip = r.Message.split("_")[1].replace(
              "或人脸核验",
              ""
            );
          }
          AppHelper.alert(r.Message || "验证码错误");
          return;
        }
        if (r.Code == "PasswordValidate") {
          AppHelper.alert(`${r.Message},请直接预订。`);
          return;
        }
        if (r.Code == "AccountValidate") {
          // this.onUnbind();
          this.validateResult = false;
        }
        if (r.Message) {
          AppHelper.alert(r.Message);
        }
      }
    } catch (e) {
      console.error(e);
      AppHelper.alert(e || "12306核验账号超时，请稍后重试！");
    }
  }
}
