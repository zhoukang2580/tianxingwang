import { CabinTypeEnum } from "./CabinTypeEnum";
export class FlightSegmentCabinModel {
  FlightNumber: string; //  航班号
  Type: CabinTypeEnum; // 舱位类型
  Code: string; //  舱位代码
  Discount: string; //  折扣率（例如 0.85，表示 85 折）
  SalesPrice: string; //  销售价
}
