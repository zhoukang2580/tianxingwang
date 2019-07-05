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
}
