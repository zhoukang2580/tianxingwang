import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController, NavController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { CredentialPipe } from "src/app/member/pipe/credential.pipe";
import { TmcService } from "src/app/tmc/tmc.service";
import { SelectCardBinsComponent } from "../components/select-card-bins/select-card-bins.component";
import { FlightGpService } from "../flight-gp.service";
import { PassengerEntity } from "../models/flightgp/PassengerEntity";
import { FrequentBookInfo } from "../models/PassengerFlightInfo";

@Component({
  selector: "app-flight-gp-add-passenger",
  templateUrl: "./flight-gp-add-passenger.page.html",
  styleUrls: ["./flight-gp-add-passenger.page.scss"],
})
export class FlightGpAddPassengerPage implements OnInit {
  passengerInfo: PassengerInfoEntity;
  private subscriptions: Subscription[] = [];
  private isOpenPageAsModal = false;
  // frequentBookInfo: FrequentBookInfo;
  passenger: PassengerEntity[] = [];
  cardType = CardType;
  credentialsType = CredentialsType;
  CardName: string;
  CardNumber: string;
  isAgent = false;

  bankType = BankType;

  isStatus: any;
  Organization: string;

  Cardbins: any[] = [];
  Count: number;

  customPopoverOptions: any = {
    header: "选择证件类型",
  };

  customPopovertype: any = {
    header: "选择验证类型",
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private flightGpService: FlightGpService,
    public modalController: ModalController,
    private navCtrl: NavController,
    private tmcService: TmcService
  ) {}

  private async initSearchModelCabin() {
    this.subscriptions.push(
      this.flightGpService.getPassengerBookInfoGpSource().subscribe((m) => {
        m.find((it) => (this.Count = it.Cabin.Count));
      })
    );
  }

  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightGpService.getfrequentBookInfoSource().subscribe((m) => {
        this.Cardbins = m;
      })
    );
  }

  ngOnInit() {
    try {
      this.route.queryParamMap.subscribe(async (q) => {
        // this.isShareType = Boolean(q.get("isShareType"));
        this.isAgent = this.tmcService.isAgent;
        // this.initSearchModelParams();
        this.CardName = "中国建设银行";
        this.CardNumber = "628366";
        this.passengerInfo = {
          Name: "",
          CredentialsTypeName: this.cardType.Waiting,
          CredentialsType: this.credentialsType.IdCard,
          Number: "",
          bankCard: {
            BankBin: "",
            BankName: "",
            Tag: "",
          },
          Mobile: "",
        };

        this.isStatus = this.bankType.official;

        // this.passengerInfo = {} as any;
        this.initSearchModelParams();
        this.initSearchModelCabin();
      });
    } catch (error) {
      console.log(error);
    }
  }

  getCheckout() {
    const obj = {
      name: this.passengerInfo.Name,
      cardType: this.passengerInfo.CredentialsType,
      cardId: this.passengerInfo.Number,
      bankCard: this.passengerInfo.bankCard,
      Organization: this.Organization,
      phone: this.passengerInfo.Mobile,
    };
    let credential: PassengerEntity;
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
    } else {
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

  async onAddPassInfo() {
    try {
      const isVerify = this.getCheckout();
      if (isVerify) {
        this.passengerInfo.CredentialsTypeName = new CredentialPipe().transform(
          this.passengerInfo.CredentialsType
        );
        const frequentBookInfo: FrequentBookInfo = {
          passengerEntity: {
            Name: this.passengerInfo.Name,
            CredentialsTypeName: this.passengerInfo.CredentialsTypeName,
            CredentialsType: this.passengerInfo.CredentialsType,
            Number: this.passengerInfo.Number,
            Variables: !this.isAgent
              ? {
                  BankBin: this.CardNumber,
                  BankName: this.CardName,
                  Tag: "1",
                }
              : this.isStatus == "公务卡"
              ? {
                  BankBin: this.CardNumber,
                  BankName: this.CardName,
                  Tag: "1",
                }
              : {
                  Organization: this.Organization,
                  Tag: "2",
                },
            Mobile: this.passengerInfo.Mobile,
          } as any,
        };

        const passengerDate = {
          Name: this.passengerInfo.Name,
          CredentialsTypeName: this.passengerInfo.CredentialsTypeName,
          CredentialsType: this.passengerInfo.CredentialsType,
          Number: this.passengerInfo.Number,
          Variables: JSON.stringify(
            !this.isAgent
              ? {
                  BankBin: this.CardNumber,
                  BankName: this.CardName,
                  Tag: "1",
                }
              : this.isStatus == "公务卡"
              ? {
                  BankBin: this.CardNumber,
                  BankName: this.CardName,
                  Tag: "1",
                }
              : {
                  Organization: this.Organization,
                  Tag: "2",
                }
          ),
          Mobile: this.passengerInfo.Mobile,
        } as PassengerEntity;

        const addPassenger = await this.flightGpService.addPassengerSubmit(
          passengerDate
        );
        if (addPassenger) {
          const ok = await AppHelper.alert(
            LanguageHelper.Flight.getAddMorePassengersTip(),
            true,
            `确定`
          );

          if (ok) {
            await this.onAddPassengerBookInfo(frequentBookInfo);
            this.back();
          }
        }
      }
    } catch (error) {
      AppHelper.alert(error);
    }
  }

  private async onAddPassengerBookInfo(frequentBookInfo: FrequentBookInfo) {
    const can = this.Cardbins.length < this.Count;
    if (!can) {
      AppHelper.alert("余票不足");
      return false;
    }

    const can1 = this.Cardbins.length < 6;
    if (!can1) {
      AppHelper.alert(LanguageHelper.Flight.getCannotBookMorePassengerTip());
      return false;
    }
    // if (this.selectedFrequent) {
    //   if(!this.selectedFrequent.find(it=>it.passengerEntity.Id==this.selectedCredentialId)){
    this.flightGpService.addFrequentBookInfo(frequentBookInfo);
    //   }else{
    //     AppHelper.alert("已添加该乘客");
    //   }
    // }
  }

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
      this.passengerInfo.bankCard = `${c}`;
      this.CardName = `${c.Name}`;
      this.CardNumber = `${c.Number}`;
    }
  }

  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };

  onSearch(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    console.log(evt, "evt", this.isStatus);
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
  CredentialsType: CredentialsType;
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

export enum BankType {
  // [Description("等待验证")]
  official = "公务卡",
  // [Description("真实")]
  unit = "单位",
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
