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
  NavController
} from "@ionic/angular";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { StaffEntity } from "src/app/hr/staff.service";

@Component({
  selector: "app-select-passenger",
  templateUrl: "./select-passenger.page.html",
  styleUrls: ["./select-passenger.page.scss"]
})
export class SelectPassengerPage implements OnInit {
  passengerFlightSegments: PassengerFlightSegments[];
  keyword: string;
  passengers: StaffEntity[];
  currentPage = 1;
  pageSize = 10;
  vmStaffs: StaffEntity[];
  loading = false;
  @ViewChild(IonRefresher) ionrefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  constructor(
    public popoverController: PopoverController,
    private flightService: FlightService,
    route: ActivatedRoute,
    private navCtrl: NavController,
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    route.queryParamMap.subscribe(p => {
      this.passengerFlightSegments = this.flightService.getPassengerFlightSegments();
    });
  }

  ngOnInit() {}
  async onShow() {
    const popover = await this.popoverController.create({
      component: SelectedPassengersComponent,
      translucent: true,
      showBackdrop: true,
      componentProps: {
        passengers: this.flightService.getPassengerFlightSegments()
      }
    });
    popover.present();
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
    this.loading = true;
    this.doRefresh(this.keyword.trim());
  }
  private async loadStaffs() {
    this.loading = true;
    const identity = await this.identityService.getIdentityAsync();
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-StaffEntity";
    req.Version = "1.0";
    req.Data = {
      LastUpdateTime: 0,
      TmcId: identity.Numbers.TmcId
    };
    this.passengers = await this.apiService
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
    this.loading = false;
    return this.passengers;
  }
  onSelect(s: StaffEntity) {
    const item: PassengerFlightSegments = {
      passenger: s,
      selectedInfo: [],
    };
    this.flightService.addPassengerFlightSegments(item);
    this.back();
  }
  back() {
    this.navCtrl.back();
  }
  async loadMore() {
    if (!this.passengers || this.passengers.length === 0) {
      await this.loadStaffs();
    }
    let filteredStaffs = this.passengers;
    if (this.keyword && this.keyword.trim()) {
      this.keyword = this.keyword.trim();
      filteredStaffs = this.passengers.filter(
        s =>
          s.Name.includes(this.keyword) ||
          s.Nickname.includes(this.keyword) ||
          s.Number.includes(this.keyword) ||
          s.Email.includes(this.keyword)
      );
    }
    const slice = filteredStaffs.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
    this.vmStaffs = [...this.vmStaffs, ...slice];

    if (slice.length) {
      this.currentPage++;
    }
    if (this.ionrefresher) {
      this.ionrefresher.complete();
    }
    if (this.scroller) {
      this.scroller.disabled = slice.length === 0;
      this.scroller.complete();
    }
    this.loading = false;
  }
}
