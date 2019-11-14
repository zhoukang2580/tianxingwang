import { CredentialsEntity } from "./../../../tmc/models/CredentialsEntity";
import { SearchFlightModel } from "./../../flight.service";
import { Observable, Subscription } from "rxjs";
import { Router } from "@angular/router";
import { CalendarService } from "../../../tmc/calendar.service";
import { AppHelper } from "./../../../appHelper";
import { StaffEntity, StaffBookType } from "src/app/hr/staff.service";
import { StaffService } from "../../../hr/staff.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import {
  ModalController,
  AlertController,
  NavController
} from "@ionic/angular";
import { FlightService } from "src/app/flight/flight.service";
import { FlightSegmentEntity } from "./../../models/flight/FlightSegmentEntity";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { LanguageHelper } from "src/app/languageHelper";
import * as moment from "moment";
import { tap, map, reduce } from "rxjs/operators";
import { SelectFlightsegmentCabinComponent } from "../select-flightsegment-cabin/select-flightsegment-cabin.component";
import { TripType } from "src/app/tmc/models/TripType";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import {
  CurrentViewtFlightSegment,
  IFlightSegmentInfo
} from "../../models/PassengerFlightInfo";
import { FlightCabinEntity } from '../../models/flight/FlightCabinEntity';
@Component({
  selector: "app-selected-flightsegment-info",
  templateUrl: "./selected-flightsegment-info.component.html",
  styleUrls: ["./selected-flightsegment-info.component.scss"]
})
export class SelectedFlightsegmentInfoComponent implements OnInit, OnDestroy {
  passengerAndBookInfos$: Observable<PassengerBookInfo<IFlightSegmentInfo>[]>;
  searchModel: SearchFlightModel;
  searchModelSubscrition = Subscription.EMPTY;
  identity: IdentityEntity;
  showSelectReturnTripButton = false;
  currentViewtFlightSegment: CurrentViewtFlightSegment;
  TripType = TripType;
  constructor(
    private modalCtrl: ModalController,
    private flightService: FlightService,
    private alertController: AlertController,
    private flydayService: CalendarService,
    private staffService: StaffService,
    private router: Router,
    private navCtrl: NavController
  ) { }
  ngOnDestroy() {
    this.searchModelSubscrition.unsubscribe();
  }
  async ngOnInit() {
    this.searchModelSubscrition = this.flightService
      .getSearchFlightModelSource()
      .subscribe(m => {
        this.searchModel = m;
      });
    this.currentViewtFlightSegment = this.flightService.getCurrentViewtFlightSegment();
    this.passengerAndBookInfos$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(
        tap(async infos => {
          if (await this.staffService.isSelfBookType()) {
            const goinfo = infos.find(
              item =>
                item.bookInfo &&
                item.bookInfo.tripType == TripType.departureTrip
            );
            const backInfo = infos.find(
              item =>
                item.bookInfo && item.bookInfo.tripType == TripType.returnTrip
            );
            if (goinfo && backInfo) {
              this.showSelectReturnTripButton = false;
            }
            this.showSelectReturnTripButton =
              this.flightService.getSearchFlightModel().isRoundTrip &&
              goinfo &&
              !backInfo;
          } else {
            this.showSelectReturnTripButton = false;
          }
        })
      );
  }
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => { });
    }
  }
  getTime(takofftime: string) {
    if (takofftime && takofftime.includes("T")) {
      return moment(takofftime).format(" HH:mm ");
    }
    return takofftime;
  }
  async nextStep() {
    const bookInfos = this.flightService.getPassengerBookInfos().filter(it => !!it.bookInfo);
    const isSelf = await this.staffService.isSelfBookType();
    const s = this.flightService.getSearchFlightModel();
    if (isSelf && s.isRoundTrip && bookInfos.length == 1) {
      const ok = await AppHelper.alert("您尚未选择回程", true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
      if (!ok) {
        return;
      }
    }
    this.flightService.dismissAllTopOverlays();
    this.router.navigate([AppHelper.getRoutePath("flight-book")]);
  }
  async reelect(info: PassengerBookInfo<IFlightSegmentInfo>) {
    await this.flightService.reselectPassengerFlightSegments(info);
  }
  showLowerSegment(info: PassengerBookInfo<IFlightSegmentInfo>) {
    const pfs = info.bookInfo;
    return (pfs && pfs.lowerSegmentInfo);
  }
  async onSelectLowestSegment(info: PassengerBookInfo<IFlightSegmentInfo>) {
    const { lowestCabin, lowestFlightSegment } = this.flightService.getLowerFlight(info);
    if (!lowestCabin||!lowestFlightSegment) {
      await AppHelper.alert(
        LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
      );
      return "";
    }
    const m = await this.modalCtrl.create({
      component: SelectFlightsegmentCabinComponent,
      componentProps: {
        policiedCabins: [lowestCabin],
        flightSegment: lowestFlightSegment
      }
    });
    m.backdropDismiss = false;
    await this.flightService.dismissTopOverlay();
    await m.present();
    const result = await m.onDidDismiss();
    const data = info.bookInfo;
    if (result.data) {
      const cbin = result.data;
      if (!cbin) {
        await AppHelper.alert(
          LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
        );
      } else {
        const bookInfo: IFlightSegmentInfo = {
          flightPolicy: cbin,
          flightSegment: lowestFlightSegment,
          tripType: data.tripType,
          id: AppHelper.uuid(),
          lowerSegmentInfo: null,
        };
        bookInfo.flightPolicy.LowerSegment=null;// 更低价仅能选择一次.
        const newInfo: PassengerBookInfo<IFlightSegmentInfo> = {
          id: AppHelper.uuid(),
          passenger: info.passenger,
          credential: info.credential,
          isNotWhitelist: info.isNotWhitelist,
          bookInfo
        };
        this.flightService.replacePassengerBookInfo(info, newInfo);
      }
    }
  }

  async remove(item: PassengerBookInfo<IFlightSegmentInfo>, message?: string) {
    const al = await this.alertController.create({
      header: LanguageHelper.getHintTip(),
      message:
        message || LanguageHelper.Flight.getConfirmRemoveFlightSegmentTip(),
      buttons: [
        {
          text: LanguageHelper.getConfirmTip(),
          handler: async () => {
            await this.flightService.removePassengerBookInfo(item);
            if (al) {
              al.dismiss();
            }
          }
        },
        {
          text: LanguageHelper.getCancelTip(),
          handler: () => { }
        }
      ]
    });
    al.backdropDismiss = false;
    await al.present();
    await al.onDidDismiss();
  }
  getDate(s: FlightSegmentEntity) {
    if (!s) {
      return "";
    }
    const day = this.flydayService.generateDayModel(moment(s.TakeoffTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getTripTypeTip(info: IFlightSegmentInfo) {
    if (!info) {
      return "";
    }
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
      }]`;
  }

  async onSelectReturnTrip() {
    await this.flightService.onSelectReturnTrip();
  }
}
