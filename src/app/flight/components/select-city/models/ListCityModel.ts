import { Trafficline } from 'src/app/flight/flight.service';


export class ListCityModel {
  link: string;
  displayName: string;
  items?: Trafficline[];
  rect?: DOMRect | ClientRect;
  offsetTop?: number;
}
