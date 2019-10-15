import { AppHelper } from "src/app/appHelper";
import { Router } from "@angular/router";
import { MessageService, MessageModel } from "./../message.service";
import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import {
  IonRefresher,
  IonInfiniteScroll,
  IonList,
  NavController
} from "@ionic/angular";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";

@Component({
  selector: "app-message-list",
  templateUrl: "./message-list.page.html",
  styleUrls: ["./message-list.page.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0" })),
      transition("true<=>false", animate("300ms"))
    ])
  ]
})
export class MessageListPage implements OnInit, AfterViewInit {
  messages: MessageModel[];
  currentPage = 0;
  pageSize = 10;
  loading = false;
  open = false;
  isSelectAll = false;
  @ViewChild(IonList) ionList: IonList;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChildren("msgDetial") msgDetialEles: QueryList<ElementRef<HTMLElement>>;
  constructor(
    private messageService: MessageService,
    private router: Router,
    private navCtrl: NavController
  ) {}
  async loadMore() {
    const messages = await this.messageService.loadMoreMessages(
      this.currentPage,
      this.pageSize
    );
    if (messages && messages.length) {
      this.currentPage++;
      this.messages = [...this.messages, ...messages];
    }
    if (this.scroller) {
      this.scroller.disabled = messages && messages.length === 0;
      this.scroller.complete();
    }
    if (this.refresher) {
      this.refresher.complete();
    }
    // if (this.messages.length == 0) {
    //   this.messages.push({
    //     IsRead: false,
    //     Url: "",
    //     Id: "000",
    //     InsertTime: "2019-08-27T17:51:00",
    //     Title: "测试",
    // tslint:disable-next-line: max-line-length
    //     Detail: `您的火车票账单已经生成成功<a href='http://test.excel.agent.download.beeant.com/files/download/excel/20190821/58c7ecae48384047999832794d8edbd1.xlsx?timestamp=1567293674.39136&contenttype=application/octet-stream&sign=823840366a1914283eba269771b52b2d&name=火车票账单-0001-01-01-0001-01-02'>火车票账单</a>`
    //   });
    // }
  }
  back() {
    this.navCtrl.back();
  }
  onEdit() {
    this.open = !this.open;
  }
  onSelectAll() {
    console.log("onSelectAll");
    this.messages.forEach(item => {
      item.IsSelected = true;
    });
    this.isSelectAll = true;
  }
  onUnSelectAll() {
    this.messages.forEach(item => {
      item.IsSelected = false;
    });
    this.isSelectAll = false;
  }
  onItemClick(item: MessageModel) {
    console.log("onItemClick");
    // if (!item.Url && this.msgDetialEles) {
    //   const el = this.msgDetialEles.find(
    //     it =>
    //       it.nativeElement && it.nativeElement.getAttribute("msgid") == item.Id
    //   );
    //   if (el && el.nativeElement) {
    //     const a = el.nativeElement.querySelector("a");
    //     if (a) {
    //       item.Url = a.href;
    //     }
    //   }
    // }
    if (this.open) {
      item.IsSelected = !item.IsSelected;
      return;
    }
    this.router.navigate([AppHelper.getRoutePath("message-detail")], {
      queryParams: { message: JSON.stringify(item) }
    });
  }
  async doRefresh() {
    if (this.scroller) {
      this.scroller.disabled = true;
      setTimeout(() => {
        this.scroller.disabled = false;
      }, 200);
    }
    this.currentPage = 0;
    this.messages = [];
    this.loading = true;
    await this.loadMore();
    this.loading = false;
  }
  async onRemove(item: MessageModel) {
    console.log("onRemove");
    const result = await this.messageService.Remove([item.Id]);
    if (result) {
      this.messages = this.messages.filter(it => it.Id !== item.Id);
    }
    this.ionList.closeSlidingItems();
  }
  async onRemoveAll() {
    const result = await this.messageService.Remove(
      this.messages.map(it => it.Id)
    );
    if (result) {
      this.ionList.closeSlidingItems();
      this.messages = [];
      this.doRefresh();
      this.isSelectAll = false;
    }
  }
  onSelect(msg: MessageModel) {
    msg.IsSelected = true;
  }
  onUnSelect(msg: MessageModel) {
    msg.IsSelected = false;
  }
  async onReadAll() {
    const items = this.messages.filter(it => it.IsSelected && !it.IsRead);
    if (items.length === 0) {
      return;
    }
    const result = await this.messageService.Read(items.map(it => it.Id));
    if (result) {
      this.doRefresh();
      this.ionList.closeSlidingItems();
    }
    this.isSelectAll = false;
  }
  async markRead(item: MessageModel) {
    const result = await this.messageService.Read([item.Id]);
    if (result) {
      item.IsRead = true;
      this.ionList.closeSlidingItems();
    }
  }
  ngOnInit() {
    this.doRefresh();
  }
  ngAfterViewInit() {
    this.renderDetail();
  }
  private renderDetail() {
    if (this.msgDetialEles) {
      this.msgDetialEles.changes.subscribe(_ => {
        this.msgDetialEles.forEach(e => {
          if (e.nativeElement) {
            e.nativeElement.innerHTML = e.nativeElement.getAttribute(
              "msgdetail"
            );
            const anchors = e.nativeElement.querySelectorAll("a");
            if (anchors) {
              if (anchors.length) {
                anchors.forEach(a => {
                  if (a.href) {
                    a.style.textDecoration = "none";
                    a.style.color = "var(--ion-color-dark)";
                    a.onclick = (evt: MouseEvent) => {
                      evt.preventDefault();
                      evt.stopPropagation();
                      return false;
                    };
                  }
                });
              }
            }
          }
        });
      });
    }
  }
}
