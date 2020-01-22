import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
export const routes: Routes = [
  {
    path: "rental-car",
    loadChildren: () =>
      import(`./rental-car/rental-car.module`).then(m => m.RentalCarPageModule)
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarRoutingModule {}
