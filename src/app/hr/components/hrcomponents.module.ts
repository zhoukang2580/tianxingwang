import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostcenterComponent } from './costcenter/search-costcenter.component';
import { OrganizationComponent } from './organization/organization.component';

@NgModule({
  declarations: [OrganizationComponent,CostcenterComponent],
  imports: [
    CommonModule
  ],
  entryComponents: [OrganizationComponent,CostcenterComponent],
  exports: [OrganizationComponent]
})
export class HrComponentsModule { }
