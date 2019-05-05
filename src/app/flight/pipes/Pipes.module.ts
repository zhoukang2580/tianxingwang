import { NgModule } from "@angular/core";
import { CabintypePipe } from './cabintype.pipe';
import { DatetimePipe } from "./datetime.pipe";
import { DiscountPipe } from './discount.pipe';

@NgModule({
  imports: [],
  declarations: [CabintypePipe, DatetimePipe, DiscountPipe],
  exports: [CabintypePipe, DatetimePipe, DiscountPipe]
})
export class PipesModule {

}