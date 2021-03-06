import { AppHelper } from "src/app/appHelper";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import {
  CostCenterEntity,
  StaffEntity,
  OrganizationEntity,
} from "../hr/hr.service";
import { CityEntity } from "../tmc/models/CityEntity";
import { HistoryEntity } from "../order/models/HistoryEntity";
import { TmcEntity, TravelFormEntity } from "../tmc/tmc.service";
import { RequestEntity } from "../services/api/Request.entity";
import { BaseEntity } from "../models/BaseEntity";
import { AccountEntity } from "../account/models/AccountEntity";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";

@Injectable({
  providedIn: "root",
})
export class TravelService {
  // organization:OrganizationEntity;
  // costCenter:CostCenterEntity;
  constructor(private apiService: ApiService) {}
  getlist(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = dto && dto.PageIndex<1;
    req.Method = `TmcApiTravelUrl-Home-List`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }

  getInitInfo() {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-GetInitInfo`;
    req.Data = {};
    return this.apiService.getPromiseData<{
      CostCenters: CostCenterEntity;
      Staff: StaffEntity;
      ApprovalId: string;
      ApprovalName: string;
      TripTypes: { [key: string]: string };
    }>(req);
  }

  getTravelDetail(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Detail`;
    req.Data = {
      Id: id,
    };
    return this.apiService.getPromiseData<SearchModel>(req);
  }
  calcTotalTrvavelDays(trips: TravelFormTripEntity[]) {
    if (!trips || !trips.length) {
      return 0;
    }
    const temp = trips.map((it) => {
      return {
        stdate: it.StartDate,
        eddate: it.EndDate,
        st: AppHelper.getDate((it.StartDate || "").substr(0, 10)).getTime(),
        ed: AppHelper.getDate((it.EndDate || "").substr(0, 10)).getTime(),
      };
    });
    const tempArr = temp.sort((a, b) => a.st - b.st);
    let days = 0;
    for (let i = 0; i < tempArr.length; i++) {
      const one = tempArr[i];
      const rang = {
        st: one.st,
        ed: one.ed,
      };
      const curIdx = i;
      for (let j = curIdx + 1; j <= tempArr.length - curIdx - 1; j++) {
        const next = tempArr[j];
        if (this.intersection(one.st, one.ed, next.st)) {
          i++;
          rang.st = Math.min(next.st, one.st);
          rang.ed = Math.max(next.ed, one.ed);
        }
      }
      days += Math.floor(rang.ed - rang.st) / 24 / 3600 / 1000;
    }
    days += 1;
    return days;
  }
  private intersection(st: number, ed: number, value: number) {
    return st <= value && value <= ed;
  }
  getReserve(dto: {
    TravelFormId: string;
    TravelTool: string;
    TripId: string;
  }) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Reserve`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getPromiseData<TravelFormEntity>(req);
  }
  getTravelSave(data: SearchModel) {
    const req = new RequestEntity();
    const dto = {
      ...data,
    };
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Save`;
    if (dto && dto.TravelForm) {
      if (dto.TravelForm.Trips) {
        dto.TravelForm.Trips.forEach((trip) => {
          if (
            trip.TravelTool &&
            !trip.TravelTool.toLowerCase().includes("hotel")
          ) {
            trip.CheckInCityName = "";
            trip.CheckInCityCode = "";
          }
          trip.ToCityArrive = [];
          trip.ToCities = [];
        });
      }
    }
    req.Data = {
      ...dto,
    };
    return this.apiService.getPromiseData<TravelFormEntity[]>(req);
  }
  removeTravel(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Remove`;
    req.Data = {
      Id: id,
    };
    return this.apiService.getPromiseData<any>(req);
  }
  travelSubmit(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Submit`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getPromiseData<any>(req);
  }
  travelCancel(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Cancel`;
    req.Data = {
      Id: id,
    };
    return this.apiService.getPromiseData<{ Id: string; Message: string }>(req);
  }
  getCities(data: {
    name: string;
    tripType: string;
    pageIndex: number;
    pageSize: number;
  }) {
    const req = new RequestEntity();
    req.Method = `TmcApiTravelUrl-Home-GetCitys`;
    req.Data = {
      name: data.name,
      Type: data.tripType,
      PageIndex: data.pageIndex,
      PageSize: data.pageSize,
    };
    return this.apiService.getResponse<TrafficlineEntity[]>(req);
  }
  getCostCenters() {
    const req = new RequestEntity();
    req.Method = `TmcApiTravelUrl-Home-GetCostCenters`;
    req.Data = {};
    return this.apiService.getPromiseData<CostCenterEntity[]>(req);
  }
}
export class SearchModel {
  IsShowLoading: boolean;
  /// <summary>
  /// ?????????
  /// </summary>

  /// <summary>
  /// ??????
  /// </summary>
  Cities: CityEntity[];

  /// <summary>
  /// ????????????
  /// </summary>
  CostCenters: CostCenterEntity[];

  /// <summary>
  /// ??????
  /// </summary>
  Staff: StaffEntity;

  /// <summary>
  /// ??????
  /// </summary>
  Staffs: StaffEntity[];

  Tmc: TmcEntity;

  /// <summary>
  /// ??????????????????
  /// </summary>
  Histories: HistoryEntity[];
  TravelForms: TravelFormEntity[];
  // ??????
  TravelForm: TravelFormEntity; //
  OrganizationId: string;
  TravelFormId: string;

  SearchContent: string;

  StatusType: ApprovalStatusType;
  PageIndex: number;
  PageSize: number;
  OutNumbers: { Name: string; Code: string }[];
  ApprovalId: string;
  ApprovalName: string;

  // Trips: TravelFormTripEntity[];
}
export class TravelFormTripEntity extends BaseEntity {
  Tmc: TmcEntity; //
  TravelForm: TravelFormEntity; //

  /// <summary>
  /// ????????????
  /// </summary>
  Content: string; //

  /// <summary>
  /// ????????????
  /// </summary>
  TripType: "??????" | "??????" | "?????????";
  travelTools: string[];
  TravelTool: string;
  /// <summary>
  /// ????????????
  /// </summary>
  IsBackway: boolean; //

  /// <summary>
  /// ????????????Code
  /// </summary>
  FromCityCode: string; //

  /// <summary>
  /// ??????????????????
  /// </summary>
  FromCityName: string; //
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  ToCities: TrafficlineEntity[];
  ToCityArrive: TrafficlineEntity[];
  CustomerName: string;

  /// <summary>
  /// ????????????Code
  /// </summary>
  ToCityCode: string; //

  /// <summary>
  /// ??????????????????
  /// </summary>
  ToCityName: string; //

  toCityNames: string;

  toCityInName: string;

  /// <summary>
  /// ????????????Code
  /// </summary>
  CheckInCityCode: string;
  /// <summary>
  /// ????????????Name
  /// </summary>
  CheckInCityName: string;

  /// <summary>
  /// ????????????Code
  /// </summary>
  FromAirportCity: string; //

  /// <summary>
  /// ????????????Code
  /// </summary>
  ToAirportCity: string; //

  /// <summary>
  /// ???????????????Code
  /// </summary>
  FromStationCity: string; //

  /// <summary>
  /// ???????????????Code
  /// </summary>
  ToStationCity: string; //

  /// <summary>
  /// ????????????
  /// </summary>
  StartDate: string; //

  /// <summary>
  /// ????????????
  /// </summary>
  EndDate: string; //

  /// <summary>
  /// ??????
  /// </summary>
  Day: number; //
}
export enum ApprovalStatusType {
  /// <summary>
  /// ??????
  /// </summary>
  Pass = 1,
  /// <summary>
  /// ??????
  /// </summary>
  Refuse = 2,
  /// <summary>
  /// ?????????
  /// </summary>
  Waiting = 3,

  /// <summary>
  /// ?????????
  /// </summary>
  WaiteSubmit = 4,

  /// <summary>
  /// ?????????
  /// </summary>
  Closed = 5,
}
export interface TravelNumberValue {
  Name: string;
  Code: string;
}

export class TravelFormDetailEntity extends BaseEntity {
  public Tmc: TmcEntity;
  public TravelForm: TravelFormEntity;
  Tag: string;
  /// <summary>
  /// ??????
  /// </summary>
  Number: string;
  ApplyTime: string;
  ApprovalTime: string;
  StatusType: ApprovalStatusType;
  StatusTypeName: string;
  /// <summary>
  /// ??????
  /// </summary>
  Name: string;
  /// <summary>
  /// ??????
  /// </summary>
  Content: string;
}
export enum TmcTravelApprovalType {
  /// <summary>
  /// ?????????
  /// </summary>
  None = 1,
  /// <summary>
  /// ????????????
  /// </summary>
  Free = 2,
  /// <summary>
  /// ???????????????
  /// </summary>
  Approver = 3,
}
