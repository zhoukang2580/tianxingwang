import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalController, NavController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { BankType } from "../flight-gp-add-passenger/flight-gp-add-passenger.page";
import { SelectCardBinsComponent } from "../components/select-card-bins/select-card-bins.component";
import { FlightGpService } from "../flight-gp.service";
import { PassengerEntity } from "../models/flightgp/PassengerEntity";
import { FrequentBookInfo } from "../models/PassengerFlightInfo";
import { CredentialPipe } from "src/app/member/pipe/credential.pipe";
import { TmcService } from "src/app/tmc/tmc.service";

@Component({
  selector: "app-flight-gp-update-passenger",
  templateUrl: "./flight-gp-update-passenger.page.html",
  styleUrls: ["./flight-gp-update-passenger.page.scss"],
})
export class FlightGpUpdatePassengerPage implements OnInit {
  private isOpenPageAsModal = false;
  passengerInfo: PassengerInfoEntity;
  private subscriptions: Subscription[] = [];

  selectedFrequent: any[] = [];
  customPopoverOptions: any = {
    header: "选择证件类型",
  };

  customPopovertype: any = {
    header: "选择验证类型",
  };
  cardType = CardType;
  CredentialsType = CredentialsType;
  CardName: string;
  CardNumber: string;
  Id: string;

  isAgent = false;
  isStatus: any;
  Organization: string;
  bankType = BankType;
  // flightGpService: any;
  constructor(
    private flightGpService: FlightGpService,
    private navCtrl: NavController,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private tmcService: TmcService
  ) {}

  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightGpService.getfrequentBookInfoSource().subscribe((m) => {
        this.selectedFrequent = m;
      })
    );
  }

  async ngOnInit() {
    try {
      this.route.queryParamMap.subscribe(async (q) => {
        this.Id = q.get("id");
        this.isAgent = this.tmcService.isAgent;
        this.initSearchModelParams();
        this.selectedFrequent = (this.selectedFrequent || []).filter(
          (it) => it.passengerEntity?.Id == this.Id
        );
        console.log(this.selectedFrequent, "selectedFrequent");

        let tag = this.selectedFrequent.map((it) => {
          return it?.passengerEntity?.Variables?.Tag;
        });

        console.log(tag, "tag");

        if (tag[0] == "1") {
          this.isStatus = this.bankType.official;
        } else {
          this.isStatus = this.bankType.unit;
        }

        // this.isStatus = tag ? this.bankType.official : this.bankType.unit;
      });
    } catch (error) {
      console.log(error);
    }
  }

  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };

  async onSelectBank() {
    const card = await this.flightGpService.getCardBinsBookInfo();
    const m = await AppHelper.modalController.create({
      component: SelectCardBinsComponent,
      componentProps: { dataSource: card },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      console.log(c, "c");
      // this.passengerInfo.bankCard = `${c}`;
      this.CardName = `${c.Name}`;
      this.CardNumber = `${c.Number}`;
      this.selectedFrequent.filter((e) => {
        e.passengerEntity.Variables.BankName = this.CardName;
        e.passengerEntity.Variables.BankBin = this.CardNumber;
      });
    }
  }

  getCheckOut(it: any) {
    const obj = {
      name: it.passengerEntity.Name,
      cardType: it.passengerEntity.CredentialsType,
      cardId: it.passengerEntity.Number,
      bankCard: it.passengerEntity.Variables.BankName,
      Organization: it.passengerEntity.Variables.Organization,
      phone: it.passengerEntity.Mobile,
    };
    let reg = /^[\u4E00-\u9FA5]{2,4}$/;
    var IdCardNumberReg = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
    var PassportNumberReg =
      /^1[45][0-9]{7}$|(^[P|p|S|s]\d{7}$)|(^[S|s|G|g|E|e]\d{8}$)|(^[Gg|Tt|Ss|Ll|Qq|Dd|Aa|Ff]\d{8}$)|(^[H|h|M|m]\d{8,10}$)/;
    let reg1 = /^1[0-9]{10}$/;
    if (!obj.name) {
      AppHelper.alert("联系人姓名不能为空");
      return;
    }
    if (!reg.test(obj.name)) {
      AppHelper.alert("请正确填写乘客姓名");
      return;
    }
    if (!obj.cardId) {
      AppHelper.alert("请填写证件号");
      return;
    }
    if (
      obj.cardType == CredentialsType.IdCard &&
      !IdCardNumberReg.test(obj.cardId)
    ) {
      AppHelper.alert("身份证格式有误");
      return;
    }
    if (
      obj.cardType == CredentialsType.Passport &&
      !PassportNumberReg.test(obj.cardId)
    ) {
      AppHelper.alert("护照格式有误");
      return;
    }
    if (this.isStatus == "公务卡") {
      if (!obj.bankCard) {
        AppHelper.alert("请选择公务卡");
        return;
      }
    }
    if (this.isStatus == "单位") {
      if (!obj.Organization) {
        AppHelper.alert("请选择单位");
        return;
      }
    }
    if (!obj.phone) {
      AppHelper.alert("请填写联系人手机号");
      return;
    }
    if (!reg1.test(obj.phone)) {
      AppHelper.alert("手机号格式不正确");
      return;
    }

    return true;
  }

  async onUpdPassInfo() {
    try {
      for (let it of this.selectedFrequent) {
        console.log(it.passengerEntity, "select");
        const isVerify = this.getCheckOut(it);
        if (isVerify) {
          it.passengerEntity.CredentialsTypeName =
            new CredentialPipe().transform(it.passengerEntity.CredentialsType);
          // let credential: PassengerEntity;
          const frequentBookInfo: FrequentBookInfo = {
            passengerEntity: {
              Id: it.passengerEntity.Id,
              Name: it.passengerEntity.Name,
              CredentialsTypeName: it.passengerEntity.CredentialsTypeName,
              CredentialsType: it.passengerEntity.CredentialsType,
              Number: it.passengerEntity.Number,
              Variables: !this.isAgent
                ? {
                    BankBin: it.passengerEntity.Variables.BankBin,
                    BankName: it.passengerEntity.Variables.BankName,
                    Tag: "1",
                  }
                : this.isStatus == "公务卡"
                ? {
                    BankBin: it.passengerEntity.Variables.BankBin,
                    BankName: it.passengerEntity.Variables.BankName,
                    Tag: "1",
                  }
                : {
                    Organization: it.passengerEntity.Variables.Organization,
                    Tag: "2",
                  },
              Mobile: it.passengerEntity.Mobile,
            } as any,
          };

          const passengerDate = {
            Name: it.passengerEntity.Name,
            CredentialsTypeName: it.passengerEntity.CredentialsTypeName,
            CredentialsType: it.passengerEntity.CredentialsType,
            Number: it.passengerEntity.Number,
            Id: it.passengerEntity.Id,
            Variables: JSON.stringify(
              !this.isAgent
                ? {
                    BankBin: it.passengerEntity.Variables.BankBin,
                    BankName: it.passengerEntity.Variables.BankName,
                    Tag: "1",
                  }
                : this.isStatus == "公务卡"
                ? {
                    BankBin: it.passengerEntity.Variables.BankBin,
                    BankName: it.passengerEntity.Variables.BankName,
                    Tag: "1",
                  }
                : {
                    Organization: it.passengerEntity.Variables.Organization,
                    Tag: "2",
                  }
            ),
            Mobile: it.passengerEntity.Mobile,
          } as PassengerEntity;

          await this.onAddPassengerBookInfo(frequentBookInfo);
          this.back();
          const update = await this.flightGpService.updatePassengerSubmit(
            passengerDate
          );

          if (update) {
            const ok = await AppHelper.alert("已完成修改", true, `确定`);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async onAddPassengerBookInfo(frequentBookInfo: FrequentBookInfo) {
    this.flightGpService.updataFrequentBookInfo(frequentBookInfo);
  }

  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (!this.isOpenPageAsModal) {
      this.navCtrl.pop();
    } else {
      this.modalController.getTop().then((t) => {
        if (t) {
          t.dismiss();
        }
      });
    }
  }
}

export class PassengerInfoEntity {
  Name: string;
  CredentialsTypeName: CardType;
  Number: string;
  bankCard: any;
  Mobile: string;
}

export enum CardType {
  // [Description("等待验证")]
  Waiting = "身份证",
  // [Description("真实")]
  True = "护照",
}

export enum CredentialsType {
  /// <summary>
  /// 身份证
  /// </summary>
  /// [Description("身份证")]
  IdCard = 1,
  /// <summary>
  /// 护照
  /// </summary>
  /// [Description("护照")]
  Passport = 2,
}
