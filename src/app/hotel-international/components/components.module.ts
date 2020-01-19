import { HotelListItemComponent } from "./hotel-list-item/hotel-list-item.component";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [HotelListItemComponent],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [HotelListItemComponent]
})
export class HotelInternationalComponentsModule {}
