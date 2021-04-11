import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { StylePageGuard } from "src/app/guards/style-page.guard";
import { MemberPipesModule } from "src/app/member/pipe/pipe.module";
import { InternationalFlightComponentsModule } from "../components/international-flight.components.module";

import { InternationalFlightBookDfPage } from "./international-flight-book-df.page";

const routes: Routes = [
  {
    path: "",
    component: InternationalFlightBookDfPage,
    canActivate: [StylePageGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternationalFlightBookDfPageRoutingModule {}
