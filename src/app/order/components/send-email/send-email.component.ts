import { AppHelper } from "src/app/appHelper";
import {
  PopoverController,
  ModalController,
  IonSelect,
  DomController
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  AfterViewInit,
  QueryList,
  Renderer2,
  OnDestroy
} from "@angular/core";
import { TmcService } from "../../../tmc/tmc.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-send-email",
  templateUrl: "./send-email.component.html",
  styleUrls: ["./send-email.component.scss"]
})
export class SendEmailComponent implements OnInit, AfterViewInit, OnDestroy {
  emails: string[];
  defaultEmail: string;
  email: string;
  subject: string;
  lang = "cn";
  type = "FlightIssue";
  orderTicketId: string;
  emailContent: string;
  isAddingEmail = false;
  isLoading = false;
  @ViewChild("content") content: ElementRef<HTMLElement>;
  @ViewChildren(IonSelect) ionSelects: QueryList<IonSelect>;
  ionSelectsSubscribtion = Subscription.EMPTY;
  selectItemList: { Text: string; Value: string }[] = [];
  constructor(
    private modalController: ModalController,
    private tmcService: TmcService,
    private domCtrl: DomController,
    private renderer: Renderer2
  ) {}
  async back() {
    const p = await this.modalController.getTop();
    if (p) {
      p.dismiss();
    }
  }
  ngOnDestroy() {
    this.ionSelectsSubscribtion.unsubscribe();
  }
  ngAfterViewInit() {
    this.ionSelectsSubscribtion = this.ionSelects.changes.subscribe(_ => {
      if (this.ionSelects) {
        this.domCtrl.write(_ => {
          this.ionSelects.forEach(el => {
            console.log(el);
            if (el["el"] && el["el"].shadowRoot) {
              const textDiv = el["el"].shadowRoot.querySelector(".select-text");
              console.log(textDiv);
              if (textDiv) {
                this.renderer.setStyle(textDiv, "display", "flex");
                this.renderer.setStyle(textDiv, "align-items", "center");
                this.renderer.setStyle(textDiv, "justify-content", "flex-end");
              }
            }
          });
        });
      }
    });
  }
  onAddEmailMode() {
    this.isAddingEmail = true;
  }
  compareFn(it1: string, it2: string) {
    return it1 && it2 && it1 == it2;
  }
  async onChange() {
    if (this.type) {
      this.isLoading = true;
      const result = await this.tmcService.GetFlightEmail(
        this.type,
        this.orderTicketId,
        this.lang
      );
      this.isLoading = false;
      this.subject = result.Subject || "";
      this.emailContent = result.Body || "";
      this.emails = result.ToEmails || [];
      if (!this.emails.find(it => it == this.defaultEmail)) {
        this.emails.unshift(this.defaultEmail);
      }
      if (this.content && this.emailContent) {
        this.content.nativeElement.innerHTML = this.emailContent;
      }
      this.emails = this.emails.filter(it => !!it);
    }
  }
  async ngOnInit() {
    this.emails = [this.defaultEmail];
    this.selectItemList = await this.tmcService.getEmailTemplateSelectItemList();
    this.onChange();
  }
  async done() {
    this.emails = this.emails && this.emails.filter(e => !!e && !!e.trim());
    if (!this.emails || this.emails.length == 0) {
      AppHelper.alert("邮件地址不能为空");
      return;
    }
    if (!this.subject) {
      AppHelper.alert("邮件标题不能为空");
      return;
    }
    if (!this.emailContent) {
      AppHelper.alert("邮件内容不能为空");
      return;
    }
    const p = await this.modalController.getTop();
    if (p) {
      await p.dismiss({
        emails: this.emails,
        subject: this.subject,
        content: this.emailContent
      });
    }
  }
  edit(e: string) {
    this.isAddingEmail = true;
    this.email = e;
  }
  remove(m: string) {
    this.emails = this.emails.filter(it => it != m);
  }
  addEmail() {
    if (this.email && !this.emails.find(it => it == this.email)) {
      this.emails.push(this.email);
    }
    this.email = "";
    this.isAddingEmail = false;
  }
}
