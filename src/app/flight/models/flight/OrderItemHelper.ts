import { OrderItemEntity } from "src/app/order/models/OrderEntity";

export class OrderItemHelper {
  // #region 机票
  static FlightTicket = "FlightTicket";
  static FlightTicketTax = "FlightTicketTax";
  static FlightTicketRate = "FlightTicketRate";
  static FlightTicketReward = "FlightTicketReward";
  static FlightTicketExchange = "FlightTicketExchange";
  static FlightTicketExchangeTax = "FlightTicketExchangeTax";
  static FlightTicketExchangeRate = "FlightTicketExchangeRate";
  static FlightTicketExchangeReward = "FlightTicketExchangeReward";
  // static FlightTicketRefund = "FlightTicketRefund";
  // static FlightTicketRefundTax = "FlightTicketRefundTax";
  static FlightTicketRefund = "FlightTicketRefund";
  static FlightTicketRefundTax = "FlightTicketRefundTax";
  static FlightTicketRefundUsedTicket = "FlightTicketRefundUsedTicket";
  static FlightTicketRefundUsedTax = "FlightTicketRefundUsedTax";
  static FlightTicketRefundDeduction = "FlightTicketRefundDeduction";
  static FlightTicketRefundRate = "FlightTicketRefundRate";
  static FlightTicketRefundReward = "FlightTicketRefundReward";

  static FlightTicketOnlineFee = "FlightTicketOnlineFee";
  static FlightTicketOfflineFee = "FlightTicketOfflineFee";
  static FlightTicketExchangeOnlineFee = "FlightTicketExchangeOnlineFee";
  static FlightTicketExchangeOfflineFee = "FlightTicketExchangeOfflineFee";
  static FlightTicketRefundOnlineFee = "FlightTicketRefundOnlineFee";
  static FlightTicketRefundOfflineFee = "FlightTicketRefundOfflineFee";
  static FlightTicketApiFee = "FlightTicketApiFee";
  static FlightTicketExchangeApiFee = "FlightTicketExchangeApiFee";
  static FlightTicketRefundApiFee = "FlightTicketRefundApiFee";
  // #region 火车票
  static TrainTicket = "TrainTicket";
  static TrainTicketExchange = "TrainTicketExchange";
  static TrainTicketRefund = "TrainTicketRefund";
  static TrainTicketRefundDeduction = "TrainTicketRefundDeduction";
  static TrainTicketOnlineFee = "TrainTicketOnlineFee";
  static TrainTicketOfflineFee = "TrainTicketOfflineFee";
  static TrainTicketExchangeOnlineFee = "TrainTicketExchangeOnlineFee";
  static TrainTicketExchangeOfflineFee = "TrainTicketExchangeOfflineFee";
  static TrainTicketRefundOnlineFee = "TrainTicketRefundOnlineFee";
  static TrainTicketRefundOfflineFee = "TrainTicketRefundOfflineFee";
  static TrainTicketApiFee = "TrainTicketApiFee";
  static TrainTicketExchangeApiFee = "TrainTicketExchangeApiFee";
  static TrainTicketRefundApiFee = "TrainTicketRefundApiFee";
  static Express = "Express"; // 快递费
  // #region 酒店
  static Hotel = "Hotel";
  static HotelRefundDeduction = "HotelRefundDeduction";
  static HotelItem = "HotelItem";
  static HotelOnlineFee = "HotelOnlineFee";
  static HotelOfflineFee = "HotelOfflineFee";
  static HotelApiFee = "HotelApiFee";

  // #region 保险
  static Insurance = "Insurance";
  static InsuranceRefundDeduction = "InsuranceRefundDeduction";
  // #endregion
  // 租车-start
  static Car = "Car";
  static CarItem = "CarItem";
  static CarRefundDeduction = "CarRefundDeduction";
  static CarOnlineFee = "CarOnlineFee";
  static CarOfflineFee = "CarOfflineFee";
  static CarOrtherFee = "CarOrtherFee";
  static CarSelfPay = "CarSelfPay";
  // 租车-end
  public static GetFlightAllAmount(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems.reduce((acc, it) => (acc += +it.Amount), 0);
  }
  public static GetFlightAllFee(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems
          .filter(
            it =>
              it.Tag == this.FlightTicketTax ||
              it.Tag == this.FlightTicketExchangeTax ||
              it.Tag == this.FlightTicketExchangeOnlineFee ||
              it.Tag == this.FlightTicketExchangeOfflineFee ||
              it.Tag == this.FlightTicketRefundOnlineFee ||
              it.Tag == this.FlightTicketRefundOfflineFee ||
              it.Tag == this.FlightTicketApiFee ||
              it.Tag == this.FlightTicketExchangeApiFee ||
              it.Tag == this.FlightTicketRefundApiFee
          )
          .reduce((acc, it) => (acc += +it.Amount), 0);
  }
  public static GetFlightAllTax(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems
          .filter(
            it => it.Tag && it.Tag.includes("Flight") && it.Tag.endsWith("Fee")
          )
          .reduce((acc, it) => (acc += +it.Amount), 0);
  }
  public static GetFlightAllTicketPrice(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems
          .filter(
            it =>
              it.Tag &&
              it.Tag.includes("Flight") &&
              !it.Tag.endsWith("Fee") &&
              !it.Tag.endsWith("Tax")
          )
          .reduce((acc, it) => (acc += +it.Amount), 0);
  }
  // #endregion

  public static GetTrainAllAmount(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems.reduce((acc, it) => (acc += +it.Amount), 0);
  }

  public static GetTrainAllFee(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems
          .filter(
            it =>
              it.Tag == this.TrainTicketOnlineFee ||
              it.Tag == this.TrainTicketOfflineFee ||
              it.Tag == this.TrainTicketExchangeOnlineFee ||
              it.Tag == this.TrainTicketExchangeOfflineFee ||
              it.Tag == this.TrainTicketRefundOnlineFee ||
              it.Tag == this.TrainTicketRefundOfflineFee ||
              it.Tag == this.TrainTicketApiFee ||
              it.Tag == this.TrainTicketExchangeApiFee ||
              it.Tag == this.TrainTicketRefundApiFee
          )
          .reduce((acc, it) => (acc += +it.Amount), 0);
  }
  // #endregion

  public static GetHotelAllAmount(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems.reduce((acc, it) => (acc += +it.Amount), 0);
  }

  public static GetHotelAllFee(orderItems: OrderItemEntity[]) {
    return orderItems == null
      ? 0
      : orderItems.reduce((acc, it) => (acc += +it.Amount), 0);
  }
  // #endregion
}
