import { PassengerModel } from "./PassengerModel";
import { OrderLinkmanModel } from "./OrderLinkmanModel";

export class BookModel {
  Channel: string; // 订单来源（IOS, Android, Pc, H5）
  Passengers: PassengerModel[]; // List<PassengerDto> 订单旅客
  Linkmans: OrderLinkmanModel[]; // List<OrderLinkmanDto> 订单联系人
}
