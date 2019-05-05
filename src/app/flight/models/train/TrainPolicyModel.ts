import { SeatTypeEnum } from "./SeatTypeEnum";
export class TrainPolicyModel {
  TrainNo: string; //  Yes 列车号
  SeatType: SeatTypeEnum; // Yes 座位类型
  IsAllowBook: boolean; // Yes 是否可预订
  Rules: string[]; // List<:string;// > No 违反的差标信息
}
