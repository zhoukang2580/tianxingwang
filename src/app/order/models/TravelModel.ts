import { PagerModel } from "./PagerModel";
import { OrderTripModel } from "src/app/order/models/OrderTripModel";
import { InsuranceResultEntity } from "src/app/tmc/models/Insurance/InsuranceResultEntity";

export class TravelModel extends PagerModel {
  PageSize: number;
  PageIndexName: string;
  Trips: OrderTripModel[];
  InsuranceResult: InsuranceResultEntity;
  AjaxFunction: string; // null;
  ClientId: string; // "pager4c90091bbf25430782960d530aeb893f";
  DataCount: number; // 0;
  FirstUrl: string; // null;
  LastFlightId: string; // null;
  LastHotelId: string; // null;
  LastTime: string; // null;
  LastTrainId: string; // null;
  LastUrl: string; // null;
  Links: string; // null;
  NextUrl: string; // null;
  PageCount: number; // 0;
  PageIndex: number; // 0;
  PageSizeName: string; // null;
  PageSizeUrl: string; // null;
  PreviousUrl: string; // null;
}
