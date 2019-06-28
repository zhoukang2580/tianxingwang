import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MsgcomponentsModule } from "./components/msgcomponent.module";
import { Routes, RouterModule } from "@angular/router";
export const routes: Routes = [
  {
    path: "message-list",
    loadChildren: "./message-list/message-list.module#MessageListPageModule"
  },
  {
    path: "message-detail",
    loadChildren:
      "./message-detail/message-detail.module#MessageDetailPageModule"
  }
];
@NgModule({
  declarations: [],
  imports: [CommonModule, MsgcomponentsModule, RouterModule.forChild(routes)],
  exports: [MsgcomponentsModule, RouterModule]
})
export class MessageModule {}
