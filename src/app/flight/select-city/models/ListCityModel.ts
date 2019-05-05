import { FlyCityItemModel } from "./CityItemModel";


export class ListCityModel {
    link: string;
    displayName: string;
    items?: FlyCityItemModel[];
    rect?: DOMRect | ClientRect;
    offsetTop?: number;
}
