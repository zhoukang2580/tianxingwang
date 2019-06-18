import { FlyCityItemModel } from "./FlyCityItemModel";


export class ListCityModel {
    link: string;
    displayName: string;
    items?: FlyCityItemModel[];
    rect?: DOMRect | ClientRect;
    offsetTop?: number;
}
