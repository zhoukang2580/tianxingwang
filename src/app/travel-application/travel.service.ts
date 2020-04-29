import { Injectable } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { CostCenterEntity, StaffEntity } from '../hr/staff.service';
import { CityEntity } from '../tmc/models/CityEntity';
import { HistoryEntity } from '../order/models/HistoryEntity';
import { TmcEntity } from '../tmc/tmc.service';
import { RequestEntity } from '../services/api/Request.entity';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  constructor(private apiService: ApiService, ) { }
  getlist(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-List`;
    req.Data = {
      ...dto
    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  getTravelDetail(){
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Detail`;
    req.Data = {


    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  getTravelSave(){
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Save`;
    req.Data = {


    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  travelSubmit(){
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Submit`;
    req.Data = {


    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  travelCancel(){
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Cancel`;
    req.Data = {


    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
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
  Staff: StaffEntity

  /// <summary>
  /// 人员
  /// </summary>
  Staffs: StaffEntity[]

  Tmc: TmcEntity

  /// <summary>
  /// 审批历史记录
  /// </summary>
  Histories: HistoryEntity[]


  //参数


  OrganizationId: string
  TravelFormId: string


  SearchContent: string;
  StatusType: ApprovalStatusType;
  PageIndex: number;
  PageSize: number;


  AccountId: string
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
  WaiteSubmit = 4
}
export interface TravelFormEntity {

  Id: string;
  TravelNumber: string;
  Number: string;
  ApplyTime: string;
  ApprovalTime: string;
  StatusType: ApprovalStatusType;
}