import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CredentialsComponent } from "./credentials/credentials.component";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { ControlsModule } from "src/app/components/controls/controls.module";
import { MemberPipesModule } from "../pipe/pipe.module";

@NgModule({
  declarations: [CredentialsComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ControlsModule,
    MemberPipesModule,
  ],
  exports: [CredentialsComponent],
})
export class MemberComponentsModule {}
