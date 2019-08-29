import { IdentityService } from "./../services/identity/identity.service";
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { PassengerBookInfo } from "../tmc/tmc.service";
import { Subject, combineLatest } from "rxjs";
import { StaffService } from "../hr/staff.service";
import { TrafficlineEntity } from '../tmc/models/TrafficlineEntity';
export class SearchHotelModel {
  TrainCode: string;
  checkinDate:string;
  checkoutDate:string;
  BackDate: string;
  FromStation: string;
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  ToStation: string;
  TrainNo: string;
  isLocked?: boolean;
  tripType: "checkin"|'checkout';
  isRoundTrip?: boolean; // 是否是往返
  isRefreshData?: boolean;
}
@Injectable({
  providedIn: "root"
})
export class HotelService {
  private bookInfos: PassengerBookInfo[];
  private bookInfoSource: Subject<PassengerBookInfo[]>;
  private searchHotelModelSource: Subject<SearchHotelModel>;
  private searchHotelModel: SearchHotelModel;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private staffService: StaffService
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
      if(this.getSearchHotelModel()){

      }
    }
  }
  getBookInfos() {
    return this.bookInfos || [];
  }
  private setBookInfoSource(bookInfos: PassengerBookInfo[]) {
    this.bookInfos = bookInfos || [];
    this.bookInfoSource.next(this.bookInfos);
  }
  getBookInfoSource() {
    return this.bookInfoSource.asObservable();
  }
}
