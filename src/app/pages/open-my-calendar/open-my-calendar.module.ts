import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { OpenMyCalendarPageRoutingModule } from "./open-my-calendar-routing.module";

import { OpenMyCalendarPage } from "./open-my-calendar.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenMyCalendarPageRoutingModule,
    AppComponentsModule
  ],
  declarations: [OpenMyCalendarPage]
})
export class OpenMyCalendarPageModule {}
