import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  IInternationalFlightSearchModel,
  ITripInfo,
  IFilterCondition,
  InternationalFlightService,
  IInternationalFlightSegmentInfo,
} from "../international-flight.service";
import { Subscription, Subject, BehaviorSubject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import {
  StaffEntity,
  StaffApprover,
  CostCenterEntity,
  OrganizationEntity,
} from "src/app/hr/staff.service";
import { TaskType } from "src/app/workflow/models/TaskType";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { OrderTravelType } from "src/app/order/models/OrderTravelEntity";

@Component({
  selector: "app-flight-ticket-reserve",
  templateUrl: "./flight-ticket-reserve.page.html",
  styleUrls: ["./flight-ticket-reserve.page.scss"],
})
export class FlightTicketReservePage implements OnInit, OnDestroy {
  searchModel: IInternationalFlightSearchModel;
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  curTrip: ITripInfo;
  condition: IFilterCondition;
  error: any;
  isCheckingPay = false;
  totalPriceSource: Subject<number>;
  vmCombindInfos: ICombindInfo[];
  constructor(
    private flightService: InternationalFlightService,
    private route: ActivatedRoute
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }
  ngOnDestroy() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.error = "";
      })
    );
  }
  ngOnInit() {
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.flightService.getSearchModelSource().subscribe((s) => {
        this.searchModel = s;
        if (s && s.trips) {
          this.curTrip = s.trips.find((it) => !it.bookInfo);
          if (!this.curTrip) {
            this.curTrip = s.trips[s.trips.length - 1];
          }
        }
      })
    );
    this.subscriptions.push(
      this.flightService.getFilterConditionSource().subscribe((c) => {
        this.condition = c;
      })
    );
    console.log(this.searchModel, "this.searchModel");
  }
}

export interface ICombindInfo {
  id: string;
  vmModal: PassengerBookInfo<IInternationalFlightSegmentInfo>;
  modal: PassengerBookInfo<IInternationalFlightSegmentInfo>;
  passengerDto: PassengerDto;
  openrules: boolean; // 打开退改签规则
  vmCredential: CredentialsEntity;
  credentials: CredentialsEntity[];
  expenseType: string;
  credentialsRequested: boolean;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  isSkipApprove: boolean;
  notifyLanguage: string;
  serviceFee: number;
  isShowGroupedInfo: boolean;
  isShowTrip: boolean;
  credentialStaffMobiles: {
    checked: boolean;
    mobile: string;
  }[];
  credentialStaffOtherMobile: string;
  credentialStaffApprovers: {
    Tag: string;
    Type: TaskType;
    approvers: StaffApprover[];
  }[];
  credentialStaffEmails: {
    checked: boolean;
    email: string;
  }[];
  credentialStaffOtherEmail: string;
  showFriendlyReminder: boolean;
  costCenters: CostCenterEntity[];
  selectedCostCenter: CostCenterEntity;
  illegalReason: any;
  otherIllegalReason: any;
  isOtherIllegalReason: boolean;
  isOtherCostCenter: boolean;
  costCenter: {
    code: string;
    name: string;
  };
  otherCostCenterName: any;
  otherCostCenterCode: any;
  isOtherOrganization: boolean;
  organization: OrganizationEntity;
  otherOrganizationName: string;
  selectedInsuranceProductId: string;
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    disabled: boolean;
    showDetail?: boolean;
  }[];
  tmcOutNumberInfos: ITmcOutNumberInfo[];
  travelType: OrderTravelType; // 因公、因私
}
