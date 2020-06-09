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
import { OrderTrainTicketEntity } from '../../models/OrderTrainTicketEntity';
import { OrderInsuranceStatusType } from "../../models/OrderInsuranceStatusType";


@Component({
  selector: 'app-train-order-price-popover',
  templateUrl: './train-order-price-popover.component.html',
  styleUrls: ['./train-order-price-popover.component.scss'],
})
export class TrainOrderPricePopoverComponent implements OnInit {
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
    return (
      this.order.OrderItems &&
      this.order.OrderItems.filter(
        (it) => it.Key == orderHotelKey
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0)
    );
  }
  getOrderFees(t: OrderTrainTicketEntity) {
    return (
      this.order &&
      this.order.VariablesJsonObj &&
      this.order.VariablesJsonObj.orderFees[t.Id]
    );
  }
  getPriceAmount(t: OrderTrainTicketEntity) {
    this.amount = 0;
    if (
      this.order &&
      this.order.VariablesJsonObj &&
      this.order.VariablesJsonObj.orderFees[t.Id]
    ) {
      this.order.VariablesJsonObj.orderFees[t.Id].forEach(
        (f) => (this.amount += f.Value)
      );
      if( this.getInsurances(t)){
        this.getInsurances(t).forEach(
          (i) => (this.amount += parseInt(i.Premium))
        );
      }
    }
    // console.log(this.amount,"this.amount");
    return this.amount;
  }
  getInsurances(t: OrderTrainTicketEntity) {
    return (
      this.order &&
      this.order.OrderInsurances &&
      this.order.OrderInsurances.filter(
        (it) => it.TravelKey == (t && t.Key)
      ).filter(
        (it) =>
          it.Status != OrderInsuranceStatusType.Abolish &&
          it.Status != OrderInsuranceStatusType.Refunded &&
          it.Status != OrderInsuranceStatusType.PayFailure
      )
    );
  }
}
