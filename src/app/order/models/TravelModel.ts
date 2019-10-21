import { PagerModel } from './PagerModel';
import { OrderTripModel } from 'src/app/order/models/OrderTripModel';
import { InsuranceResultEntity } from 'src/app/tmc/models/Insurance/InsuranceResultEntity';

export class TravelModel extends PagerModel {
    PageSize: number;
    PageIndexName: string;
    Trips: OrderTripModel[];
    InsuranceResult: InsuranceResultEntity;
}