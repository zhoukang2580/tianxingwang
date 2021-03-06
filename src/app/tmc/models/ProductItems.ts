export class ProductItem {
  label: string;
  labelEn: string;
  value: ProductItemType;
  imageSrc: string;
  isDisplay?: boolean;
  order?: number;
  items?: ProductItem[];
}
export enum ProductItemType {
  plane = 1,
  train = 2,
  hotel = 3,
  insurance = 4,
  more = 5,
  waitingApprovalTask = 6,
  car = 7
}
