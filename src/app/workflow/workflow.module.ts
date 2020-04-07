import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkflowRoutingModule } from "./workflow-routing.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, WorkflowRoutingModule],
  exports: [WorkflowRoutingModule]
})
export class WorkflowModule {}
