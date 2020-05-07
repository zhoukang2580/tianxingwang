import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TmcCalendarPageRoutingModule } from "./tmc-calendar-routing.module";

import { TmcCalendarPage } from "./tmc-calendar.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { TmcComponentsModule } from "../components/tmcComponents.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TmcCalendarPageRoutingModule,
    AppComponentsModule,
    TmcComponentsModule,
  ],
  declarations: [TmcCalendarPage],
})
export class TmcCalendarPageModule {}
