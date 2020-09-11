import { AppHelper } from "src/app/appHelper";
import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import {
  CostCenterEntity,
  StaffEntity,
  OrganizationEntity,
} from "../hr/staff.service";
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
    req.IsShowLoading = dto && dto.IsShowLoading;
    req.Method = `TmcApiTravelUrl-Home-List`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getResponse<SearchModel>(req);
  }

  getStaff() {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-GetStaff`;
    req.Data = {};
    return this.apiService.getPromiseData<{
      staff: StaffEntity;
      approvalStaff: StaffEntity;
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
  getTravelSave(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Save`;
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
  /// 差旅单
  /// </summary>

  /// <summary>
  /// 城市
  /// </summary>
  Cities: CityEntity[];

  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenters: CostCenterEntity[];

  /// <summary>
  /// 人员
  /// </summary>
  Staff: StaffEntity;

  /// <summary>
  /// 人员
  /// </summary>
  Staffs: StaffEntity[];

  Tmc: TmcEntity;

  /// <summary>
  /// 审批历史记录
  /// </summary>
  Histories: HistoryEntity[];
  TravelForms: TravelFormEntity[];
  // 参数
  TravelForm: TravelFormEntity; //
  OrganizationId: string;
  TravelFormId: string;

  SearchContent: string;

  StatusType: ApprovalStatusType;
  PageIndex: number;
  PageSize: number;
  OutNumbers: { Name: string; Code: string }[];
  AccountId: string;
  ApprovalStaffName: string;

  // Trips: TravelFormTripEntity[];
}
export class TravelFormTripEntity extends BaseEntity {
  Tmc: TmcEntity; //
  TravelForm: TravelFormEntity; //

  /// <summary>
  /// 行程内容
  /// </summary>
  Content: string; //

  /// <summary>
  /// 出行工具
  /// </summary>
  TripType: "国内" | "国际" | "港澳台";
  travelTools: string[];
  TravelTool: string;
  /// <summary>
  /// 单程往返
  /// </summary>
  IsBackway: boolean; //

  /// <summary>
  /// 出发城市Code
  /// </summary>
  FromCityCode: string; //

  /// <summary>
  /// 出发城市名称
  /// </summary>
  FromCityName: string; //
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  ToCities: TrafficlineEntity[];
  ToCityArrive: TrafficlineEntity[];

  /// <summary>
  /// 到达城市Code
  /// </summary>
  ToCityCode: string; //

  /// <summary>
  /// 到达城市名称
  /// </summary>
  ToCityName: string; //

  toCityNames: string;

  toCityInName: string;

  /// <summary>
  /// 入住城市Code
  /// </summary>
  CheckInCityCode: string;
  /// <summary>
  /// 入住城市Name
  /// </summary>
  CheckInCityName: string;

  /// <summary>
  /// 出发机场Code
  /// </summary>
  FromAirportCity: string; //

  /// <summary>
  /// 到达机场Code
  /// </summary>
  ToAirportCity: string; //

  /// <summary>
  /// 出发火车站Code
  /// </summary>
  FromStationCity: string; //

  /// <summary>
  /// 到达火车站Code
  /// </summary>
  ToStationCity: string; //

  /// <summary>
  /// 开始时间
  /// </summary>
  StartDate: string; //

  /// <summary>
  /// 结束时间
  /// </summary>
  EndDate: string; //

  /// <summary>
  /// 时长
  /// </summary>
  Day: number; //
}
export enum ApprovalStatusType {
  /// <summary>
  /// 通过
  /// </summary>
  Pass = 1,
  /// <summary>
  /// 拒绝
  /// </summary>
  Refuse = 2,
  /// <summary>
  /// 待审核
  /// </summary>
  Waiting = 3,

  /// <summary>
  /// 待提交
  /// </summary>
  WaiteSubmit = 4,
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
  /// 编号
  /// </summary>
  Number: string;
  ApplyTime: string;
  ApprovalTime: string;
  StatusType: ApprovalStatusType;
  StatusTypeName: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 内容
  /// </summary>
  Content: string;
}
export enum TmcTravelApprovalType {
  /// <summary>
  /// 不审批
  /// </summary>
  None = 1,
  /// <summary>
  /// 自由审批
  /// </summary>
  Free = 2,
  /// <summary>
  /// 固定审批人
  /// </summary>
  Approver = 3,
}
