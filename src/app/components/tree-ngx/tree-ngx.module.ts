import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNgxComponent } from './tree-ngx.component';
import { NodeComponent } from './node/node.component';
import { TreeService } from './service/tree-service';
import { NodeNameComponent } from './node-name/node-name.component';
import { NodeIconWrapperComponent } from './node-icon-wrapper/node-icon-wrapper.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TreeNgxComponent,
    NodeComponent,
    NodeNameComponent,
    NodeIconWrapperComponent,
  ],
  providers: [
    TreeService
  ],
  exports: [
    TreeNgxComponent
  ]
})
export class TreeNgxModule { }
