import {
  Component,
} from "@angular/core";
import { AddContact } from '../../models/AddContact';
import { AddcontactsModalEnComponent } from '../addcontacts-modal_en/addcontacts-modal_en.component';
import { BookAddcontactsCompComponent } from "../book-addcontacts-comp/book-addcontacts-comp.component";

@Component({
  selector: "app-book-addcontacts-comp_en",
  templateUrl: "./book-addcontacts-comp_en.component.html",
  styleUrls: ["./book-addcontacts-comp_en.component.scss"],
})
export class BookAddcontactsCompEnComponent extends BookAddcontactsCompComponent {
  async onAddContacts() {
    if (!this.contacts) {
      this.contacts = [];
    }
    const m = await this.modalCtrl.create({
      component: AddcontactsModalEnComponent,
      componentProps: {
        title: this.buttonText,
      },
    });
    if (m) {
      m.backdropDismiss = false;
      m.present();
      const result = await m.onDidDismiss();
      if (result && result.data) {
        const data = result.data as { Text: string; Value: string };
        if (data && data.Value) {
          if (data.Value.includes("|")) {
            const [email, mobile, accountId] = data.Value.split("|");
            const man = new AddContact();
            man.notifyLanguage = "cn";
            man.name = data.Text;
            man.email = email;
            man.mobile = mobile;
            man.accountId = accountId;
            this.contacts.push(man);
            this.onChange();
          }
        }
      }
    }
  }
}
