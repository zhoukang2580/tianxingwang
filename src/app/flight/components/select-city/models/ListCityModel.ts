import { FlyCityItemModel } from "./TrafficlineModel";


export class ListCityModel {
    link: string;
    displayName: string;
    items?: FlyCityItemModel[];
    rect?: DOMRect | ClientRect;
    offsetTop?: number;
}
