import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CredentialsComponent } from './credentials/credentials.component';

@NgModule({
  declarations: [CredentialsComponent],
  imports: [CommonModule],
  exports: [CredentialsComponent],
})
export class MemberComponentsModule {}
