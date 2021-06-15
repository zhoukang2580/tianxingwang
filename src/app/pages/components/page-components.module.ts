import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TreeDataComponent } from "./tree-data/tree-data.component";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { AppComponentsModule } from "src/app/components/appcomponents.module";
import { CustomeKeyboardComponent } from "./custome-keyboard/custome-keyboard.component";
import { DownloadFileComponent } from "./download-file/download-file.component";
import { AddModifyComponent } from "./add-modify/add-modify.component";
import { OpenUrlComponent } from "./open-url-comp/open-url.component";

@NgModule({
  declarations: [TreeDataComponent,CustomeKeyboardComponent,DownloadFileComponent,AddModifyComponent,OpenUrlComponent],
  imports: [CommonModule, IonicModule, FormsModule, AppComponentsModule],
  exports:[
    AppComponentsModule ,
    AddModifyComponent,
    CustomeKeyboardComponent,
    DownloadFileComponent
  ]
})
export class PageComponentsModule {}
