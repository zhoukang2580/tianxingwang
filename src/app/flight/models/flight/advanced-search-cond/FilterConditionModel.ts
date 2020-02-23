import { SearchTypeModel } from "./SearchTypeModel";
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';
export class FilterConditionModel {
  airCompanies: SearchTypeModel[];
  airTypes: SearchTypeModel[];
  fromAirports: SearchTypeModel[];
  toAirports: SearchTypeModel[];
  cabins: SearchTypeModel[];
  onlyDirect: boolean;
  takeOffTimeSpan: {
    lower: number;
    upper: number;
  };
  userOps: {
    // 用户是否对某类型的选项做出改变
    timespanOp: boolean;
    fromAirportOp: boolean;
    toAirportOp: boolean;
    airCompanyOp: boolean;
    airTypeOp: boolean;
    cabinOp: boolean;
  };
  fromCity:TrafficlineEntity;
  toCity:TrafficlineEntity;
  priceFromL2H?: "low2Height" | "height2Low" | "initial";
  timeFromM2N?: "am2pm" | "pm2am" | "initial";
  isFiltered = false;
  static init() {
    const condition = new FilterConditionModel();
    condition.userOps = {
      // 用户是否对某类型的选项做出改变
      timespanOp: false,
      fromAirportOp: false,
      toAirportOp: false,
      airCompanyOp: false,
      airTypeOp: false,
      cabinOp: false
    };
    condition.isFiltered = false;
    condition.airCompanies = [];
    condition.airTypes = [];
    condition.fromAirports = [];
    condition.cabins = [];
    condition.onlyDirect = false;
    condition.fromAirports = [];
    condition.toAirports = [];
    condition.takeOffTimeSpan = {
      lower: 0,
      upper: 24
    };
    condition.priceFromL2H = "initial";
    condition.timeFromM2N = "initial";
    return condition;
  }
}
