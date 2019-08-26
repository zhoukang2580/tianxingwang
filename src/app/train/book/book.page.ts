import { StaffApprover, StaffEntity } from "./../../hr/staff.service";
import { IdentityService } from "./../../services/identity/identity.service";
import {
  TmcEntity,
  TravelFormEntity,
  IllegalReasonEntity,
  TmcApprovalType
} from "src/app/tmc/tmc.service";
import { Storage } from "@ionic/storage";
import { OrderBookDto } from "../../order/models/OrderBookDto";
import { InitialBookDtoModel, PassengerBookInfo } from "../../tmc/tmc.service";
import { TrainService } from "../train.service";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChildren,
  ViewChild,
  QueryList
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { AccountEntity } from "src/app/tmc/models/AccountEntity";
import {
  NavController,
  IonCheckbox,
  IonContent,
  IonRefresher,
  ModalController
} from "@ionic/angular";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { Observable, of, from, combineLatest } from "rxjs";
import { map, tap } from "rxjs/operators";
import { StaffService } from "src/app/hr/staff.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";

@Component({
  selector: "app-train-book",
  templateUrl: "./book.page.html",
  styleUrls: ["./book.page.scss"]
})
export class TrainBookPage implements OnInit {
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChild(IonContent) cnt: IonContent;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  initialBookDto: InitialBookDtoModel;
  bookInfos: PassengerBookInfo[];
  bookModel: IBookTrainViewModel = {} as any;
  error: any;
  constructor(
    private trainService: TrainService,
    private storage: Storage,
    private navCtrl: NavController,
    private identityService: IdentityService,
    private staffService: StaffService,
    private modalCtrl: ModalController
  ) {}
  back() {
    this.navCtrl.back();
  }
  private async getInitializeBookDto() {
    const mock = await this.storage.get("mock-initialBookDto-train");
    if (mock) {
      return mock;
    }
    const bookDto = new OrderBookDto();
    bookDto.TravelFormId = AppHelper.getQueryParamers()["travelFormId"] || "";
    const infos = this.trainService.getBookInfos();
    bookDto.Passengers = [];
    infos.forEach(item => {
      if (item.passenger && item.trainInfo) {
        const p = new PassengerDto();
        p.ClientId = item.id;
        p.Train = item.trainInfo.trainEntity;
        p.Train.BookSeatType = item.trainInfo.trainPolicy.SeatType;
        p.Credentials = item.credential;
        const account = new AccountEntity();
        account.Id = item.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        bookDto.Passengers.push(p);
      }
    });
    this.initialBookDto = await this.trainService.getInitializeBookDto(bookDto);
    this.bookModel.bookDto = bookDto;
    console.log("initializeBookDto", this.initialBookDto);
    await this.storage.set("mock-initialBookDto-train", this.initialBookDto);
    return this.initialBookDto;
  }
  ngOnInit() {}
  async doRefresh() {
    try {
      this.error = "";
      this.bookInfos = this.trainService
        .getBookInfos()
        .filter(it => !!it.trainInfo);
      if (!this.bookInfos || !this.bookInfos.length) {
        this.bookInfos = (await this.storage.get("MOCK-TRAIN-BOOKINFO")) || [];
      } else {
        this.storage.set("MOCK-TRAIN-BOOKINFO", this.bookInfos);
      }
      this.initialBookDto = await this.getInitializeBookDto();
      if (!this.initialBookDto) {
        this.error = "初始化失败";
        return "";
      }
      await this.initBookViewModel();
    } catch (e) {
      console.log(e);
      this.error = e;
    }
  }
  getServiceFee(item: IPassengerBookInfo) {
    return (
      this.initialBookDto &&
      this.initialBookDto.ServiceFees &&
      this.initialBookDto.ServiceFees[item.id]
    );
  }
  isAllowSelectApprove(info: IPassengerBookInfo) {
    const Tmc = this.initialBookDto.Tmc;
    const staff = info.credentialStaff;
    if (
      !Tmc ||
      Tmc.TrainApprovalType == TmcApprovalType.None ||
      Tmc.TrainApprovalType == 0
    ) {
      return false;
    }
    if (!staff) {
      return true;
    }
    if (Tmc.TrainApprovalType == TmcApprovalType.Free) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.TrainApprovalType == TmcApprovalType.Approver
    ) {
      return true;
    }
    if (
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyFree &&
      info.bookInfo &&
      info.bookInfo.trainInfo &&
      info.bookInfo.trainInfo.trainPolicy &&
      info.bookInfo.trainInfo.trainPolicy.Rules &&
      info.bookInfo.trainInfo.trainPolicy.Rules.length
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.bookInfo.trainInfo &&
      info.bookInfo.trainInfo.trainPolicy &&
      info.bookInfo.trainInfo.trainPolicy.Rules &&
      info.bookInfo.trainInfo.trainPolicy.Rules.length
    ) {
      return true;
    }
    return false;
  }
  onOpenrules(item: IPassengerBookInfo) {
    console.log("CombineedSelectedInfo", item);
    item.isOpenrules = !item.isOpenrules;
  }
  async openApproverModal(item: IPassengerBookInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      const [name, emmail, mobile] = res.Text.split("|");
      item.appovalStaff =
        item.appovalStaff ||
        ({
          Account: new AccountEntity()
        } as any);
      item.appovalStaff.AccountId = item.appovalStaff.Account.Id = res.Value;
      item.appovalStaff.Email = item.appovalStaff.Account.Email = emmail;
      item.appovalStaff.Mobile = item.appovalStaff.Account.Mobile = mobile;
      item.appovalStaff.Name = item.appovalStaff.Account.Name = name;
    }
  }
  private async initBookViewModel() {
    this.bookModel = this.bookModel || ({} as any);
    this.bookModel.tmc = this.initialBookDto.Tmc;
    this.bookModel.identity = await this.identityService.getIdentityAsync();
    this.bookModel.isCanSkipApproval$ = combineLatest([
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentity()
    ]).pipe(
      map(([isSelfType, identity]) => {
        const tmc = this.bookModel.tmc;
        return (
          tmc &&
          tmc.TrainApprovalType != 0 &&
          tmc.TrainApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap(can => {
        console.log("是否可以跳过审批", can);
      })
    );
    this.bookModel.travelForm = this.initialBookDto.TravelFrom;
    this.bookModel.illegalReasons = this.initialBookDto.IllegalReasons.map(
      it => {
        const reason = new IllegalReasonEntity();
        reason.Name = it;
        return reason;
      }
    );
  }
}
export interface IBookTrainViewModel {
  tmc: TmcEntity;
  bookDto: OrderBookDto;
  travelForm: TravelFormEntity;
  illegalReasons: IllegalReasonEntity[];
  items: IPassengerBookInfo[];
  isCanSkipApproval$: Observable<boolean>;
  identity: IdentityEntity;
}
export interface IPassengerBookInfo {
  credential: CredentialsEntity;
  notifyLanguage: string;
  isSkipApprove: boolean;
  id: string;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  bookInfo: PassengerBookInfo;
  isOpenrules: boolean;
}
