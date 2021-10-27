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
  ElementRef,
} from "@angular/core";
import { AddContact } from "src/app/tmc/models/AddContact";
import { AddcontactsModalComponent } from "src/app/tmc/components/addcontacts-modal/addcontacts-modal.component";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-flightbook-addcontacts",
  templateUrl: "./flightbook-addcontacts.component.html",
  styleUrls: ["./flightbook-addcontacts.component.scss"],
})
export class FlightBookAddcontactsCompComponent implements OnInit {
  private LangService: LangService;
  @Input() buttonText = "添加联系人";
  @Input() contacts: AddContact[];
  @Output() contactsChange: EventEmitter<any>;
  constructor(
    public modalCtrl: ModalController,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
  ) {
    this.themeService.getModeSource().subscribe(m=>{
      if(m=='dark'){
        this.refEle.nativeElement.classList.add("dark")
      }else{
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
    this.contactsChange = new EventEmitter();
  }

  ngOnInit() {}
  onOpen(el: IonSelect) {
    el.open();
  }
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
  async onAddContacts() {
    if (!this.contacts) {
      this.contacts = [];
    }
    const m = await this.modalCtrl.create({
      component: AddcontactsModalComponent,
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
