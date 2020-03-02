import { CarBookType } from './CarBookType';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';
import { OrderPassengerEntity } from './OrderPassengerEntity';
import { OrderEntity, OrderItemEntity } from './OrderEntity';
import { OrderCarStatusType } from './OrderCarStatusType';
import { OrderInvoiceEntity } from './OrderInvoiceEntity';
import { OrderPayEntity } from './OrderInsuranceEntity';
import { OrderTravelEntity } from './OrderTravelEntity';
import { CarPaymentType } from './CarPaymentType';

export class OrderCarEntity extends BaseVariablesEntity {

    /// <summary>
    /// 订单
    /// </summary>
    Order: OrderEntity;


    /// <summary>
    /// 乘客
    /// </summary>
    Passenger: OrderPassengerEntity;

    /// <summary>
    /// 订单状态
    /// </summary>
    Status: OrderCarStatusType;
    /// <summary>
    /// 预定类型
    /// </summary>
    BookType: CarBookType;

    BookCode: string;
    /// <summary>
    /// 供应商类型
    /// </summary>
    Supplier: string;
    /// <summary>
    /// 
    /// </summary>
    Number: string;
    /// <summary>
    /// 租车类型
    /// </summary>
    CarType: string;
    /// <summary>
    /// 罚金
    /// </summary>
    PenaltyAmount: string;
    /// <summary>
    /// 罚金成本
    /// </summary>
    PenaltyCost: string;
    /// <summary>
    /// 退单时间
    /// </summary>
    RefundTime: string;

    /// <summary>
    /// 出发地址
    /// </summary>
    FromAddress: string;

    /// <summary>
    /// 到达地址
    /// </summary>
    ToAddress: string;

    /// <summary>
    /// 实际出发地址
    /// </summary>
    ActualFromAddress: string;

    /// <summary>
    /// 实际到达地址
    /// </summary>
    ActualToAddress: string;

    /// <summary>
    /// 用车城市
    /// </summary>
    CityName: string;


    /// <summary>
    /// 出发时间
    /// </summary>
    FromTime: string;

    /// <summary>
    /// 到达时间
    /// </summary>
    ArriveTime: string;

    /// <summary>
    /// 路程
    /// </summary>
    Distance: string;

    /// <summary>
    /// 总费用
    /// </summary>
    TotalAmount: string;

    /// <summary>
    /// 接单时间
    /// </summary>
    ReceiptTime: string;

    /// <summary>
    /// 支付时间
    /// </summary>
    PayTime: string;

    Key: string;

    /// <summary>
    /// 外部编号
    /// </summary>
    OutNumber: string;

    /// <summary>
    /// 状态名称
    /// </summary>
    StatusName: string;

    /// <summary>
    /// 
    /// </summary>
    BookTime: string;

    /// <summary>
    /// 支付类型
    /// </summary>
    PaymentType: CarPaymentType;

    /// <summary>
    /// 说明
    /// </summary>
    Explain: string;

    /// <summary>
    /// 租车
    /// </summary>
    DataEntity: OrderCarEntity;

    /// <summary>
    /// 订单项
    /// </summary>
    OrderItems: OrderItemEntity[];
    /// <summary>
    /// 支付信息
    /// </summary>
    OrderPays: OrderPayEntity[];
    /// <summary>
    /// 发票信息
    /// </summary>
    OrderInvoices: OrderInvoiceEntity[];

    /// <summary>
    /// 投保人
    /// </summary>
    OrderTravel: OrderTravelEntity;
}