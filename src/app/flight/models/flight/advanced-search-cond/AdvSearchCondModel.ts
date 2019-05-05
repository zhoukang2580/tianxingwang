import { SearchTypeModel } from './SearchTypeModel';
export class AdvSearchCondModel {
  airCompanies: SearchTypeModel[];
  airTypes: SearchTypeModel[];
  airports: SearchTypeModel[];
  cabins: SearchTypeModel[];
  onlyDirect: boolean;
  takeOffTimeSpan: {
    lower: number;
    upper: number;
  };
}
