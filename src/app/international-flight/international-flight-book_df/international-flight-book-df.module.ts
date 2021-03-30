import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { InternationalFlightBookDfPageRoutingModule } from "./international-flight-book-df-routing.module";

import { InternationalFlightBookDfPage } from "./international-flight-book-df.page";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { TmcComponentsModule } from "src/app/tmc/components/tmcComponents.module";
import { InternationalFlightComponentsModule } from "../components/international-flight.components.module";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppComponentsModule,
    InternationalFlightBookDfPageRoutingModule,
    TmcComponentsModule,
    InternationalFlightComponentsModule,
    AppComponentsModule,
    MemberPipesModule,
  ],
  declarations: [InternationalFlightBookDfPage],
})
export class InternationalFlightBookDfPageModule {}
