import { LangService } from "../../../services/lang.service";
import { LanguageHelper } from "../../../languageHelper";
import { AppHelper } from "../../../appHelper";
import { IonSelect, ModalController } from "@ionic/angular";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from "@angular/core";
import { AddContact } from "src/app/tmc/models/AddContact";
import { AddcontactsModalComponent } from "src/app/tmc/components/addcontacts-modal/addcontacts-modal.component";
import { AddcontactsModalDfComponent } from '../addcontacts-modal-df/addcontacts-modal-df.component';

@Component({
  selector: "app-book-addcontacts-comp-df",
  templateUrl: "./book-addcontacts-comp-df.component.html",
  styleUrls: ["./book-addcontacts-comp-df.component.scss"],
})
export class BookAddcontactsCompDfComponent implements OnInit {
  @Input() buttonText = "添加联系人";
  @Input() contacts: AddContact[];
  @Output() contactsChange: EventEmitter<any>;
  constructor(
    public modalCtrl: ModalController,
    private langService: LangService
  ) {
    this.contactsChange = new EventEmitter();
  }

  ngOnInit() {}
  async remove(man: AddContact) {
    const ok = await AppHelper.alert(
      LanguageHelper.getConfirmDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (ok && man && this.contacts) {
      this.contacts = this.contacts.filter(
        (it) => it.accountId != man.accountId
      );
    }
    this.onChange();
  }
  onOpenSelect(select: IonSelect) {
    if (select) {
      select.open();
    }
  }
  async onAddContacts() {
    if (!this.contacts) {
      this.contacts = [];
    }
    const m = await this.modalCtrl.create({
      component: AddcontactsModalDfComponent,
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
  onChange() {
    this.contactsChange.emit(this.contacts);
  }
}
