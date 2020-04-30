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
import { TrafficlineEntity } from '../tmc/models/TrafficlineEntity';

@Injectable({
  providedIn: "root",
})
export class TravelService {
  // organization:OrganizationEntity;
  // costCenter:CostCenterEntity;
  constructor(private apiService: ApiService) {}
  getlist(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-List`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getResponse<SearchModel>(req);
  }
  getTravelDetail(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Detail`;
    req.Data = {
      Id: id,
    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  getTravelSave(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Save`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  travelSubmit(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Submit`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getResponse<any>(req);
  }
  travelCancel(id: string) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Cancel`;
    req.Data = {
      Id: id,
    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  getCities(name: string) {
    const req = new RequestEntity();
    req.Method = `TmcApiTravelUrl-Home-GetCitys`;
    req.Data = {
      name,
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

  AccountId: string;

  Trips: TravelFormTripEntity[];
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
  TravelTool: "机票" | "火车票" | "酒店" | "租车";
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

  /// <summary>
  /// 到达城市Code
  /// </summary>
  ToCityCode: string; //

  /// <summary>
  /// 到达城市名称
  /// </summary>
  ToCityName: string; //

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
