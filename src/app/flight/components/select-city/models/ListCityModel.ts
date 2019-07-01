import { TrafficlineModel } from "./TrafficlineModel";

export class ListCityModel {
  link: string;
  displayName: string;
  items?: TrafficlineModel[];
  rect?: DOMRect | ClientRect;
  offsetTop?: number;
}
