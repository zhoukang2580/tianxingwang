import { LanguageHelper } from './../../../languageHelper';
import { AppHelper } from './../../../appHelper';
import { ModalController } from "@ionic/angular";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AddcontactsModalComponent } from "../addcontacts-modal/addcontacts-modal.component";
import { AddContact } from '../../models/AddContact';

@Component({
  selector: "app-book-addcontacts-comp",
  templateUrl: "./book-addcontacts-comp.component.html",
  styleUrls: ["./book-addcontacts-comp.component.scss"]
})
export class BookAddcontactsCompComponent implements OnInit {
  @Input() addContacts: AddContact[];
  @Output() contactChange: EventEmitter<any>;
  constructor(private modalCtrl: ModalController) {
    this.contactChange = new EventEmitter();
  }

  ngOnInit() { }
  async remove(man: AddContact) {
    const ok = await AppHelper.alert(LanguageHelper.getConfirmDeleteTip(), true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
    if (ok && man && this.addContacts) {
      this.addContacts = this.addContacts.filter(it => it.accountId != man.accountId);
    }
  }
  async onAddContacts() {
    if (!this.addContacts) {
      this.addContacts = [];
    }
    const m = await this.modalCtrl.create({
      component: AddcontactsModalComponent
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
            this.addContacts.push(man);
            this.onChange();
          }
        }
      }
    }
  }
  onChange() {
    this.contactChange.emit(this.addContacts);
  }
}
