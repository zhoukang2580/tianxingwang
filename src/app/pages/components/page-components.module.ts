import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TreeDataComponent } from "./tree-data/tree-data.component";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { AppComponentsModule } from "src/app/components/appcomponents.module";

@NgModule({
  declarations: [TreeDataComponent],
  imports: [CommonModule, IonicModule, FormsModule, AppComponentsModule],
})
export class PageComponentsModule {}
