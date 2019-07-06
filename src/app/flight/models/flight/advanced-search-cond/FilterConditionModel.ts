import { SearchTypeModel } from "./SearchTypeModel";
export class FilterConditionModel {
  airCompanies: SearchTypeModel[];
  airTypes: SearchTypeModel[];
  airports: SearchTypeModel[];
  cabins: SearchTypeModel[];
  onlyDirect: boolean;
  takeOffTimeSpan: {
    lower: number;
    upper: number;
  };
  priceFromL2H?: "low2Height" | "height2Low" | "initial";
  timeFromM2N?: "am2pm" | "pm2am" | "initial";
  static init() {
    const condition = new FilterConditionModel();
    condition.airCompanies = [];
    condition.airTypes = [];
    condition.airports = [];
    condition.cabins = [];
    condition.onlyDirect = false;
    condition.takeOffTimeSpan = {
      lower: 0,
      upper: 24
    };
    condition.priceFromL2H = "initial";
    condition.timeFromM2N = "initial";
    return condition;
  }
}
