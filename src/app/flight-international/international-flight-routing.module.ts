import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
const routes: Routes = [
  {
    path: "search-international-flight",
    loadChildren: () =>
      import(
        "./search-international-flight/search-international-flight.module"
      ).then(m => m.SearchInternationalFlightPageModule)
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class FlightInternationalRoutingModule {}
