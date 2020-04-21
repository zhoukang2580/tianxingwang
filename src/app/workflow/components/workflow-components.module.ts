import { AppComponentsModule } from "./../../components/appcomponents.module";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [],
  imports: [CommonModule, AppComponentsModule],
  exports: [AppComponentsModule]
})
export class WorkflowComponentsModule {}
