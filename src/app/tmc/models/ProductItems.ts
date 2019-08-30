export class ProductItem {
  label: string;
  value: ProductItemType;
  imageSrc: string;
  isDisplay?:boolean;
  order?:number;
}
export enum ProductItemType {
  plane = 1,
  train = 2,
  hotel = 3,
  insurance = 4,
  more = 5,
  waitingApprovalTask = 6
}
