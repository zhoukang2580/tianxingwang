import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { StaffService } from "./../../hr/staff.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ApiService } from "./../../services/api/api.service";
import { ActivatedRoute } from "@angular/router";
import {
  FlightService,
  PassengerFlightSegments,
  TripType
} from "src/app/flight/flight.service";
import { SelectedPassengersComponent } from "./../components/selected-passengers/selected-passengers.component";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  PopoverController,
  IonInfiniteScroll,
  IonRefresher,
  NavController,
  ModalController
} from "@ionic/angular";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { StaffEntity } from "src/app/hr/staff.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LanguageHelper } from "src/app/languageHelper";

@Component({
  selector: "app-select-passenger",
  templateUrl: "./select-passenger.page.html",
  styleUrls: ["./select-passenger.page.scss"]
})
export class SelectPassengerPage implements OnInit {
  passengerFlightSegments: PassengerFlightSegments[];
  keyword: string;
  selectedPasengers$: Observable<number>;
  currentPage = 1;
  pageSize = 15;
  vmStaffs: StaffEntity[];
  vmStaff: StaffEntity;
  loading = false;
  @ViewChild(IonRefresher) ionrefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  constructor(
    public modalController: ModalController,
    private flightService: FlightService,
    route: ActivatedRoute,
    private navCtrl: NavController,
    private apiService: ApiService,
    private identityService: IdentityService,
    private staffService: StaffService
  ) {
    this.selectedPasengers$ = flightService
      .getSelectedPasengerSource()
      .pipe(map(items => items.length));
    route.queryParamMap.subscribe(p => {
      this.passengerFlightSegments = this.flightService.getPassengerFlightSegments();
    });
  }

  ngOnInit() {}
  async onShow() {
    const m = await this.modalController.create({
      component: SelectedPassengersComponent
    });
    await m.present();
  }
  doRefresh(keyword) {
    this.currentPage = 1;
    this.vmStaffs = [];
    this.keyword = keyword || "";
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.loadMore();
  }
  onSearch() {
    this.vmStaff = null;
    this.loading = true;
    this.doRefresh((this.keyword || "").trim());
  }
  private async loadMore() {
    this.loading = true;
    const identity = await this.identityService.getIdentityAsync();
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-Staff";
    req.Version = "2.0";
    req.Data = {
      Name: this.keyword.trim(),
      TmcId: identity.Numbers.TmcId
    };
    this.vmStaffs = await this.apiService
      .getResponseAsync<{
        ApprovalInfo: any;
        CostCenters: any;
        IllegalReasons: any;
        Organizations: any;
        Staffs: StaffEntity[];
        Tmcs: any;
        TravelForms: any;
      }>(req)
      .then(res => res.Staffs || [])
      .catch(_ => []);
    const staff = await this.staffService.getStaff();
    if (staff.BookType == StaffBookType.All) {
      const item = new StaffEntity();
      item.AccountId = "0";
      item.CredentialsInfo = LanguageHelper.Flight.getNotWhitelistingTip();
      this.vmStaffs.unshift(item);
    }
    this.loading = false;
  }
  async onSelect(s: StaffEntity) {
    this.vmStaff = s;
  }
  onAdd() {
    const item: PassengerFlightSegments = {
      passenger: this.vmStaff,
      selectedInfo: []
    };
    this.flightService.addSelectedPassengers(this.vmStaff);
    this.flightService.addPassengerFlightSegments(item);
    this.back();
  }
  back() {
    this.navCtrl.back();
  }
}
