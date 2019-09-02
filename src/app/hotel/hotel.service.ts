import { DayModel } from "src/app/tmc/models/DayModel";
import { TripType } from "src/app/tmc/models/TripType";
import { HotelEntity } from "./models/HotelEntity";
import { IdentityService } from "./../services/identity/identity.service";
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { PassengerBookInfo } from "../tmc/tmc.service";
import { Subject, combineLatest } from "rxjs";
import { StaffService } from "../hr/staff.service";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { ModalController } from "@ionic/angular";
import { SelectDateComponent } from "../tmc/components/select-date/select-date.component";
export class SearchHotelModel {
  TrainCode: string;
  checkinDate: string;
  checkoutDate: string;
  BackDate: string;
  FromStation: string;
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  ToStation: string;
  TrainNo: string;
  isLocked?: boolean;
  tripType: TripType;
  isRoundTrip?: boolean; // 是否是往返
  isRefreshData?: boolean;
}
@Injectable({
  providedIn: "root"
})
export class HotelService {
  private bookInfos: PassengerBookInfo<IHotelInfo>[];
  private bookInfoSource: Subject<PassengerBookInfo<IHotelInfo>[]>;
  private searchHotelModelSource: Subject<SearchHotelModel>;
  private searchHotelModel: SearchHotelModel;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private staffService: StaffService,
    private modalCtrl: ModalController
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchHotelModelSource = new BehaviorSubject(null);
    combineLatest([
      this.getBookInfoSource(),
      identityService.getIdentitySource()
    ]).subscribe(async ([bookInfos, identity]) => {
      if (identity && identity.Id && identity.Ticket) {
      }
    });
  }
  getSearchHotelModel() {
    return this.searchHotelModel || new SearchHotelModel();
  }
  setSearchHotelModelSource(m: SearchHotelModel) {
    if (m) {
      this.searchHotelModelSource.next(m);
      this.searchHotelModel = m;
    }
  }
  private async initSelfBookInfo() {
    const isSelfBookType = await this.staffService.isSelfBookType();
    if (isSelfBookType && this.getBookInfos().length == 0) {
      if (this.getSearchHotelModel()) {
      }
    }
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  private setBookInfoSource(bookInfos: PassengerBookInfo<IHotelInfo>[]) {
    this.bookInfos = bookInfos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
  async openCalendar(checkInDate: DayModel) {
    const goTrain = this.getBookInfos().find(
      f => f.bookInfo && f.bookInfo.tripType == TripType.departureTrip
    );
    const s = this.getSearchHotelModel();
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime: checkInDate.timeStamp,
        tripType: s.tripType,
        isMulti: true
      }
    });
    m.present();
  }
}
export interface IHotelInfo {
  hotelEntity: HotelEntity;
  // hotelPolicy: Hotel;
  tripType?: TripType;
  id?: string;
  isLowerSegmentSelected?: boolean;
}
