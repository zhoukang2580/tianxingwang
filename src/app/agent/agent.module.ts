import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentRoutingModule } from './agent-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AgentRoutingModule
  ],
  exports:[
    AgentRoutingModule
  ]
})
export class AgentModule { }
