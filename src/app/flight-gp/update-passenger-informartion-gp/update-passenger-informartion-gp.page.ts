import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AppHelper } from 'src/app/appHelper';
import { LanguageHelper } from 'src/app/languageHelper';
import { SelectCardBinsComponent } from '../components/select-card-bins/select-card-bins.component';
import { FlightGpService } from '../flight-gp.service';
import { PassengerEntity } from '../models/flightgp/PassengerEntity';
import { FrequentBookInfo } from '../models/PassengerFlightInfo';

@Component({
  selector: 'app-update-passenger-informartion-gp',
  templateUrl: './update-passenger-informartion-gp.page.html',
  styleUrls: ['./update-passenger-informartion-gp.page.scss'],
})
export class UpdatePassengerInformartionGpPage implements OnInit {
  private isOpenPageAsModal = false;
  passengerInfo: PassengerInfoEntity;
  private subscriptions: Subscription[] = [];

  selectedFrequent: any[] = [];
  customPopoverOptions: any = {
    header: "选择证件类型",
  }
  cardType = CardType;
  CardName: string;
  CardNumber: string;
  Id: string;
  // flightGpService: any;
  constructor(
    private flightGpService: FlightGpService,
    private navCtrl: NavController,
    public modalController: ModalController,
    private route: ActivatedRoute,
  ) { }


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
        this.initSearchModelParams();
        console.log(this.selectedFrequent, "selectedFrequent");
        this.selectedFrequent = this.selectedFrequent.filter(it => it.passengerEntity?.Id == this.Id);

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
      this.CardNumber = `${c.Number}`
      this.selectedFrequent.filter((e) => {
        e.passengerEntity.Variables.BankName = this.CardName;
        e.passengerEntity.Variables.BankBin = this.CardNumber;
      })
    }
  }

  async onUpdPassInfo() {
    try {
      for (let it of this.selectedFrequent) {
        console.log(it.passengerEntity, "select");
        const obj = {
          name: it.passengerEntity.Name,
          cardType: it.passengerEntity.CredentialsTypeName,
          cardId: it.passengerEntity.Number,
          bankCard: it.passengerEntity.Variables.BankName,
          phone: it.passengerEntity.Mobile
        }
        let reg = /^[\u4E00-\u9FA5]{2,4}$/;
        let reg1 = /^[a-zA-Z0-9]{5,}$/;
        let reg2 = /^1[0-9]{10}$/;
        if (obj.name == "") {
          AppHelper.alert("联系人姓名不能为空");
          return
        } else if (!(reg.test(obj.name))) {
          AppHelper.alert("请正确填写乘客姓名");
          return
        } else if (obj.cardId == "") {
          AppHelper.alert("请填写证件号");
          return
        } else if (!(reg1.test(obj.cardId))) {
          AppHelper.alert("证件号格式有误");
          return
        } else if (obj.bankCard == "") {
          AppHelper.alert("请填公务卡所属银行");
          return
        } else if (obj.phone == "") {
          AppHelper.alert("请填写联系人手机号");
          return
        } else if (!(reg2.test(obj.phone))) {
          AppHelper.alert("手机号格式不正确");
          return
        }

        let credential: PassengerEntity;
        const frequentBookInfo: FrequentBookInfo = {
          passengerEntity: ({
            ...credential,
            Name: it.passengerEntity.Name,
            CredentialsTypeName: it.passengerEntity.CredentialsTypeName,
            Number: it.passengerEntity.Number,
            Variables: {
              BankBin: it.passengerEntity.Variables.BankBin,
              BankName: it.passengerEntity.Variables.BankName,
              Tag: "1"
            },
            Mobile: it.passengerEntity.Mobile
          } as any)
        }

        const passengerDate = {
          ...credential,
          Name: it.passengerEntity.Name,
          CredentialsTypeName: it.passengerEntity.CredentialsTypeName,
          Number: it.passengerEntity.Number,
          Id: it.passengerEntity.Id,
          Variables: JSON.stringify({
            BankBin: it.passengerEntity.Variables.BankBin,
            BankName: it.passengerEntity.Variables.BankName,
            Tag: "1"
          }),
          Mobile: it.passengerEntity.Mobile
        } as PassengerEntity

        await this.onAddPassengerBookInfo(frequentBookInfo);
        const update = await this.flightGpService.updatePassengerSubmit(passengerDate);
        if (update) {
          const ok = await AppHelper.alert(
            "已完成修改",
            true,
            `确定`
          );
          if (ok) {
            this.back();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async onAddPassengerBookInfo(
    frequentBookInfo: FrequentBookInfo
  ) {
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
};


export enum CardType {
  // [Description("等待验证")]
  Waiting = "身份证",
  // [Description("真实")]
  True = "护照",
}
