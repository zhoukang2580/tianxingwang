import {
  Component} from "@angular/core";
import { BookCredentialCompComponent } from '../book-credential-comp/book-credential-comp.component';

@Component({
  selector: "app-book-credential-comp_en",
  templateUrl: "./book-credential-comp_en.component.html",
  styleUrls: ["./book-credential-comp_en.component.scss"]
})
export class BookCredentialCompEnComponent extends BookCredentialCompComponent{
  onMaintainCredentials() {
    this.managementCredentials.emit();
    this.addCredential();
  }
  addCredential() {
    if (!this.canEdit) {
      return;
    }
    this.router.navigate(["member-credential-management_en"], {
      queryParams: { addNew: true },
    });
  }
}
