import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  Renderer2,
  ViewChild,
  ElementRef,
  NgZone,
} from "@angular/core";
import { OrderItemEntity, OrderEntity } from "../../models/OrderEntity";
import { IonGrid, IonSlides, IonText } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-hotel-order-price-popover",
  templateUrl: "./hotel-order-price-popover.component.html",
  styleUrls: ["./hotel-order-price-popover.component.scss"],
})
export class HotelOrderPricePopoverComponent implements OnInit, AfterViewInit {
  @ViewChild("container") container: ElementRef<HTMLElement>;
  @ViewChildren(IonGrid) iongrids: QueryList<IonGrid>;
  @ViewChild(IonSlides) slides: IonSlides;
  order: OrderEntity;
  IsShowServiceFee = false;
  orderItems: OrderItemEntity[];
  amount = 0;
  activeIdx = 0;
  constructor(private render: Renderer2, private ngZone: NgZone) {}
  ngAfterViewInit() {
    this.slides.getSwiper().then((swiper) => {
      console.log(swiper);
      swiper.on("slideChange", () => {
        this.ngZone.run(() => {
          this.activeIdx = swiper.realIndex;
          // console.log("slidechange", this.activeIdx);
        });
      });
      setTimeout(() => {
        swiper.update();
      }, 200);
    });
  }
  ngOnInit() {
    if (this.order && this.order.Variables) {
      this.order.VariablesJsonObj =
        this.order.VariablesJsonObj || JSON.parse(this.order.Variables) || {};
    }
  }
  getHotelServiceFee(orderHotelKey: string) {
    debugger
    return (
      this.orderItems
        .filter((it) => it.Key == orderHotelKey)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0)
    );
  }
}
