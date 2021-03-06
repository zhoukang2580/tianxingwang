import { AppHelper } from "src/app/appHelper";
import { IonSelect, ModalController, DomController } from "@ionic/angular";
import {
  Component,
  OnInit,
  NgZone,
  ElementRef,
  QueryList,
  Renderer2,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ViewChildren
} from "@angular/core";
import { Subscription } from "rxjs";
import { TmcService } from "../../../tmc/tmc.service";

@Component({
  selector: "app-send-msg",
  templateUrl: "./send-msg.component.html",
  styleUrls: ["./send-msg.component.scss"]
})
export class SendMsgComponent implements OnInit, AfterViewInit, OnDestroy {
  mobiles: string[];
  defaultMobile: string;
  mobile: string;
  lang = "cn";
  type = "FlightIssue";
  orderTicketId: string;
  msgContent: string;
  isAddingMobile = false;
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
  edit(item: string) {
    this.isAddingMobile = true;
    this.mobile = item;
  }
  ngAfterViewInit() {
    this.ionSelectsSubscribtion = this.ionSelects.changes.subscribe(_ => {
      if (this.ionSelects) {
        this.domCtrl.write(_ => {
          this.ionSelects.forEach(el => {
            if (el["el"] && el["el"].shadowRoot) {
              const textDiv = el["el"].shadowRoot.querySelector(".select-text");
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
  onAddMobileMode() {
    this.isAddingMobile = true;
  }
  compareFn(it1: string, it2: string) {
    return it1 && it2 && it1 == it2;
  }
  async onChange() {
    if (this.type) {
      this.isLoading = true;
      const result = await this.tmcService.getFlightMessage(
        this.type,
        this.orderTicketId,
        this.lang
      );
      this.isLoading = false;
      this.msgContent = result.Body || "";
      this.mobiles = result.ToMobiles || [];
      if (!this.mobiles.find(it => it == this.defaultMobile)) {
        this.mobiles.unshift(this.defaultMobile);
      }
      if (this.content && this.msgContent) {
        this.content.nativeElement.innerHTML = this.msgContent;
      }
      this.mobiles = this.mobiles.filter(it => !!it);
    }
  }
  async ngOnInit() {
    this.mobiles = [this.defaultMobile];
    this.selectItemList = await this.tmcService.getEmailTemplateSelectItemList();
    this.onChange();
  }
  async done() {
    this.mobiles = this.mobiles && this.mobiles.filter(e => !!e && !!e.trim());
    if (!this.mobiles || this.mobiles.length == 0) {
      AppHelper.alert("??????????????????????????????");
      return;
    }
    if (!this.msgContent) {
      AppHelper.alert("????????????????????????");
      return;
    }
    const p = await this.modalController.getTop();
    if (p) {
      await p.dismiss({
        mobiles: this.mobiles,
        content: this.msgContent
      });
    }
  }
  remove(m: string) {
    this.mobiles = this.mobiles.filter(it => it != m);
  }
  addMobile() {
    if (this.mobile && !this.mobiles.find(it => it == this.mobile)) {
      this.mobiles.push(this.mobile);
    }
    this.mobile = "";
    this.isAddingMobile = false;
  }
}
