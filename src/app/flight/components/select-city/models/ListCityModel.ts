import { TrafficlineEntity } from './../../../../tmc/models/TrafficlineEntity';


export class ListCityModel {
  link: string;
  displayName: string;
  items?: TrafficlineEntity[];
  rect?: DOMRect | ClientRect;
  offsetTop?: number;
}
