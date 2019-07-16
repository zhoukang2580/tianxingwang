import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CredentialPipe } from "./credential.pipe";

@NgModule({
  declarations: [CredentialPipe],
  imports: [CommonModule],
  exports: [CredentialPipe]
})
export class MemberPipesModule {}
