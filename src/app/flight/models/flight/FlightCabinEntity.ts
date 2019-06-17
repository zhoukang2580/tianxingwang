import { FlightBookType } from './FlightBookType';
import { FlightSupplierType } from './FlightSupplierType';
import { FlightCabinFareType } from './FlightCabinFareType';
import { FlightCabinType } from './FlightCabinType';
import { FlightRefundChangeEntity } from './FlightRefundChangeEntity';
import { FlightPolicyEntity } from './FlightPolicyEntity';
import { FlightSegmentEntity } from './FlightSegmentEntity';
import { InsuranceProductEntity } from 'src/app/insurance/models/InsuranceProductEntity';

export class FlightCabinEntity {

    BookType: FlightBookType;
    BookCode: string;
    /// <summary>
    /// 航班号
    /// </summary>
    FlightNumber: string;
    /// <summary>
    /// z
    /// </summary>
    PolicyId: string;
    /// <summary>
    /// 来源
    /// </summary>
    SupplierType: FlightSupplierType;
    /// <summary>
    /// 价格类型
    /// </summary>
    /// <seealso cref="FlightCabinFareType"/>
    FareType: FlightCabinFareType;
    /// <summary>
    /// 名称
    /// </summary>
    Name: string;
    /// <summary>
    /// 舱位类型
    /// </summary>
    /// <see cref="FlightCabinType"/>
    Type: FlightCabinType;
    /// <summary>
    /// 舱位代码
    /// </summary>
    Code: string;
    /// <summary>
    /// 票面价格
    /// </summary>
    TicketPrice: string;
    /// <summary>
    /// 结算价格
    /// </summary>
    SettlePrice: string;
    /// <summary>
    /// 售价
    /// </summary>
    SalesPrice: string;

    /// <summary>
    /// 税收
    /// </summary>
    Tax: string;
    /// <summary>
    /// 税收
    /// </summary>
    SettleTax: string;
    /// <summary>
    /// 航段返利
    /// </summary>
    Reward: string;
    /// <summary>
    /// 折扣
    /// </summary>
    Discount: string;
    /// <summary>
    /// 数量
    /// </summary>
    Count: string;
    /// <summary>
    /// 变量体
    /// </summary>
    Variables: { [key: string]: string };
    /// <summary>
    /// 退改签规则
    /// </summary>
    RefundChange: FlightRefundChangeEntity;
    /// <summary>
    /// 政策
    /// </summary>
    FlightPolicy: FlightPolicyEntity;
    /// <summary>
    /// 低价航班
    /// </summary>
    LowerSegment: FlightSegmentEntity;

    InsuranceProducts: InsuranceProductEntity[];
    /// <summary>
    ///  名称
    /// </summary>
    TypeName: string;

    /// <summary>
    /// 运价类型名称
    /// </summary>
    FareTypeName
        : string;
    /// <summary>
    /// 来源名称
    /// </summary>
    SupplierTypeName: string;


    /// <summary>
    /// 是否允许预订
    /// </summary>
    IsAllowOrder: boolean;
    /// <summary>
    /// 违规
    /// </summary>
    Rules: { [key: string]: string };






}