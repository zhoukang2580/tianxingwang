import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MessageComponent } from "./message/message.component";
import { IonicModule } from "@ionic/angular";

@NgModule({
  declarations: [MessageComponent],
  imports: [CommonModule, IonicModule],
  exports: [MessageComponent]
})
export class MsgcomponentsModule {}
