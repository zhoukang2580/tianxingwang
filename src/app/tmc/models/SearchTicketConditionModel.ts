import { OrderStatusType } from "./../../order/models/OrderEntity";
import { TrafficlineEntity } from "./TrafficlineEntity";

export class SearchTicketConditionModel {
  passengerName: string;
  vmFromDate: string;
  fromDate: string;
  toDate: string;
  vmToDate: string;
  orderNumber: string;
  orderStatus: OrderStatusType;
  orderFlightTicketStatusTypes: { Text: string; Value: string }[];
  orderFlightTicketStatusType: string;
  fromCity: TrafficlineEntity;
  toCity: TrafficlineEntity;
  fromCityName: string;
  toCityName: string;
  pageIndex: number;
}
