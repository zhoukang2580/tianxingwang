import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrRoutingModule } from './hr-routing.module';
import { HrComponentsModule } from './components/hrcomponents.module';


@NgModule({
  declarations: [],
  imports: [CommonModule, HrRoutingModule,HrComponentsModule],
  exports: [HrRoutingModule]
})
export class HrModule {}