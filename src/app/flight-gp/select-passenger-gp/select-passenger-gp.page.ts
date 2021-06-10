import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll, IonRefresher, ModalController, NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { flyInOut } from 'src/app/animations/flyInOut';
import { AppHelper } from 'src/app/appHelper';
import { RefresherComponent } from 'src/app/components/refresher';
import { StaffEntity } from 'src/app/hr/staff.service';
import { LanguageHelper } from 'src/app/languageHelper';
import { PassengerBookInfo } from 'src/app/tmc/tmc.service';
import { FlightGpService } from '../flight-gp.service';
import { PassengerEntity } from '../models/flightgp/PassengerEntity';
import { FrequentBookInfo } from '../models/PassengerFlightInfo';

@Component({
  selector: 'app-select-passenger-gp',
  templateUrl: './select-passenger-gp.page.html',
  styleUrls: ['./select-passenger-gp.page.scss'],
  animations: [flyInOut]
})
export class SelectPassengerGpPage implements OnInit {
  private keyword: string;
  vmKeyword: string;
  private isOpenPageAsModal = false; // 设置是否通过modalcontroller打开
  bookInfos$: Observable<PassengerBookInfo<any>[]>;
  vmStaffs: StaffEntity[];
  vmPassenger: PassengerEntity[];
  selectedCredentialId: string;
  private subscriptions: Subscription[] = [];
  loading = false;
  VariablesJsonObj: any;
  selectedFrequent: FrequentBookInfo[];

  private subscription = Subscription.EMPTY;
  @ViewChild(RefresherComponent, { static: true }) refresher: RefresherComponent;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  constructor(
    public modalController: ModalController,
    private flightGpService: FlightGpService,
    private navCtrl: NavController
  ) { }

  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightGpService.getfrequentBookInfoSource().subscribe((m) => {
        this.selectedFrequent = m;
      })
    );
  }

  ngOnInit() {
    try {
      this.initSearchModelParams();
      this.doRefresh();
    } catch (error) {
      console.log(error);
    }
  }

  doRefresh() {
    try {
      if (this.scroller) {
        this.scroller.disabled = true;
      }
      this.flightGpService.getFrequentFlyer().then((r) => {
        if (r) {
          console.log(r);
          r.forEach(it => {
            it.Variables = JSON.parse(it.Variables);
          })
          this.vmPassenger = r;
        }
      })

      setTimeout(() => {
        this.loading = false;
        if (this.refresher) {
          this.refresher.complete();
          this.content.scrollToTop();
        }
      }, 200);
    } catch (error) {
      console.error(error);
    }

    this.subscription.unsubscribe();
    console.log(this.vmPassenger, "vmPassenger");
  }

  onShow() {

  }

  onSearch(event: any) {

  }

  async onDelete(Id, idx, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    console.log(Id, 'id');
    const ok = await AppHelper.alert("确定删除吗?", true, "确定", "取消");
    if (ok == true) {
      this.flightGpService
        .deletePassenger(Id)
        .then(() => {
          this.vmPassenger.splice(idx, 1);
          this.selectedFrequent = this.selectedFrequent.filter(it => it.passengerEntity.Id != Id);
          this.flightGpService.setfrequentBookInfoSource(this.selectedFrequent);
        })
        .catch((e) => {
          console.error(e);
        });
    }

  }

  onSelectCredential(credentialId: string) {

    console.log("credentialId", credentialId);
    if (this.selectedCredentialId != credentialId) {
      this.selectedCredentialId = credentialId;
    } else if (this.selectedCredentialId) {
      this.selectedCredentialId = null;
    } else {
      this.selectedCredentialId = credentialId;
    }

    console.log("this.selectedCredentialId", this.selectedCredentialId);
  }

  async onAddPassenger() {
    try {


      let credential: PassengerEntity;
      if (!this.selectedCredentialId) {
        AppHelper.alert(
          LanguageHelper.Flight.getMustSelectOneCredentialTip(),
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        return;
      }

      credential = (this.vmPassenger || []).find((e) => e.Id == this.selectedCredentialId);


      // console.log("onAddPassenger",credential);
      if (!credential) {
        AppHelper.alert(
          LanguageHelper.Flight.getMustSelectOneCredentialTip(),
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        return;
      }

      const frequentBookInfo: FrequentBookInfo = {
        passengerEntity: ({
          ...credential
        } as any)
      }

      await this.onAddPassengerBookInfo(frequentBookInfo);
      const ok = await AppHelper.alert(
        LanguageHelper.Flight.getAddMorePassengersTip(),
        true,
        `完成`,
        `继续添加`
      );

      if (ok) {
        this.back();
      } else {
        this.doRefresh();
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async onAddPassengerBookInfo(
    frequentBookInfo: FrequentBookInfo
  ) {
    const can = this.selectedFrequent.length < 6;
    if (!can) {
      AppHelper.alert(LanguageHelper.Flight.getCannotBookMorePassengerTip());
      return false;
    }
    if (this.selectedFrequent) {
      if (!this.selectedFrequent.find(it => it.passengerEntity.Id == this.selectedCredentialId)) {
        this.flightGpService.addFrequentBookInfo(frequentBookInfo);
      } else {
        AppHelper.alert("已添加该乘客");
      }
    }
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
