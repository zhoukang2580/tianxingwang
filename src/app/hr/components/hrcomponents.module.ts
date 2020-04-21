import { AppComponentsModule } from 'src/app/components/appcomponents.module';
import { FormsModule } from '@angular/forms';
import { TreeNgxModule } from './../../components/tree-ngx/tree-ngx.module';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostcenterComponent } from './costcenter/search-costcenter.component';
import { OrganizationComponent } from './organization/organization.component';

@NgModule({
  declarations: [OrganizationComponent,CostcenterComponent],
  imports: [
    CommonModule,
    IonicModule,
    TreeNgxModule,
    FormsModule,
    AppComponentsModule
  ],
  entryComponents: [OrganizationComponent,CostcenterComponent],
  exports: [OrganizationComponent]
})
export class HrComponentsModule { }
