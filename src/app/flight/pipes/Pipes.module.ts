import { NgModule } from "@angular/core";
import { CabintypePipe } from './cabintype.pipe';
import { DatetimePipe } from "./datetime.pipe";
import { DiscountPipe } from './discount.pipe';
import { FlightpricePipe } from './flightprice.pipe';

@NgModule({
  imports: [],
  declarations: [CabintypePipe, DatetimePipe, DiscountPipe, FlightpricePipe],
  exports: [CabintypePipe, DatetimePipe, DiscountPipe,FlightpricePipe]
})
export class PipesModule {

}