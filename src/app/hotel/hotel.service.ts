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
import { MapService } from "../services/map/map.service";
export class SearchHotelModel {
  checkinDate: string;
  checkoutDate: string;
  tripType: TripType;
  isRefreshData?: boolean;
  destinationCity: TrafficlineEntity;
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
    private modalCtrl: ModalController,
    private mapService: MapService
  ) {
    this.bookInfoSource = new BehaviorSubject([]);
    this.searchHotelModelSource = new BehaviorSubject(null);
    combineLatest([
      this.getBookInfoSource(),
      identityService.getIdentitySource()
    ]).subscribe(async ([bookInfos, identity]) => {
      if (identity && identity.Id && identity.Ticket) {
        this.initSelfBookInfo();
      }
    });
  }
  getCurPosition() {
    return this.mapService.getCurrentCityPosition();
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
    }
  }
  addBookInfo(bookInfo: PassengerBookInfo<IHotelInfo>) {
    if (bookInfo) {
      this.setBookInfoSource([...this.getBookInfos(), bookInfo]);
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
  async openCalendar(
    checkInDate: DayModel,
    tripType: TripType
  ): Promise<DayModel[]> {
    if (!checkInDate) {
      return [];
    }
    const s = this.getSearchHotelModel();
    const m = await this.modalCtrl.create({
      component: SelectDateComponent,
      componentProps: {
        goArrivalTime: checkInDate.timeStamp,
        tripType: tripType,
        isMulti: true
      }
    });
    m.present();
    const result = await m.onDidDismiss();
    return result.data as DayModel[];
  }
}
export interface IHotelInfo {
  hotelEntity: HotelEntity;
  // hotelPolicy: Hotel;
  tripType?: TripType;
  id?: string;
  isLowerSegmentSelected?: boolean;
}
