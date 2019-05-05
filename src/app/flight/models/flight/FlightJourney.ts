import { FlightRouteModel } from "./FlightRouteModel";
// 行程列表
export class FlightJourney {
  Date: string; //  行程日期
  Week: string; //  星期
  FromCity: string; //  始发城市
  ToCity: string; // :string;//  到达城市
  FlightRoutes: FlightRouteModel[]; // List<FlightRoute> 飞行组合列表
}
