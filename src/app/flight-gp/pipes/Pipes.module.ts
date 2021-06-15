import { NgModule } from "@angular/core";
import { CabintypePipe } from "./cabintype.pipe";
import { DatetimePipe } from "./datetime.pipe";
import { DiscountPipe } from "./discount.pipe";
import { FlightpricePipe } from "./flightprice.pipe";
import { FlightMealTypePipe } from "./flight-meal-type.pipe";

@NgModule({
  imports: [],
  declarations: [
    CabintypePipe,
    DatetimePipe,
    DiscountPipe,
    FlightpricePipe,
    FlightMealTypePipe
  ],
  exports: [
    CabintypePipe,
    DatetimePipe,
    DiscountPipe,
    FlightpricePipe,
    FlightMealTypePipe
  ]
})
export class FlightPipesModule {}
