import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MsgcomponentsModule } from "./components/msgcomponent.module";
import { Routes, RouterModule } from "@angular/router";
export const routes: Routes = [
  {
    path: "message-list",
    loadChildren: () =>
      import("./message-list/message-list.module").then(
        m => m.MessageListPageModule
      )
  },
  {
    path: "message-detail",
    loadChildren: () =>
      import("./message-detail/message-detail.module").then(
        m => m.MessageDetailPageModule
      )
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, MsgcomponentsModule, RouterModule.forChild(routes)],
  exports: [MsgcomponentsModule, RouterModule]
})
export class MessageModule {}
