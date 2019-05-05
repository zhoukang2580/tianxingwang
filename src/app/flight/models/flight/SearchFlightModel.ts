import { AdvSearchCondModel } from './advanced-search-cond/AdvSearchCondModel';
export class SearchFlightModel {
  Date: string; //  Yes 航班日期（yyyy-MM-dd）
  FromCode: string; //  Yes 三字代码
  ToCode: string; //  Yes 三字代码
  FromAsAirport: boolean; //  No 始发以机场查询
  ToAsAirport: boolean; //  No 到达以机场查询
  TimeFromM2N?:boolean; // 时间从早到晚
  PriceFromL2H?:boolean;// 价格从低到高
  AdvSCon?:AdvSearchCondModel;// 高阶查询条件
  curPage?:number;
  pageSize?:number;
  isRoundTrip?:boolean;// 是否是往返
}
