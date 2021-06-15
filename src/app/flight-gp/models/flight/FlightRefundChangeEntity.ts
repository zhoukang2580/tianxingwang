import { FlightRefundDetailEntity } from './FlightRefundDetailEntity';
import { FlightChangeDetailEntity } from './FlightChangeDetailEntity';
import { FlightEndorsementDetailEntity } from './FlightEndorsementDetailEntity';

/// <summary>
/// 航班退改签实体类
/// </summary>
export class FlightRefundChangeEntity {
    Airline: string;// 
    Cabin: string;// 
    /// <summary>
    /// 退票信息
    /// </summary>
    RefundDetail: FlightRefundDetailEntity;// 
    /// <summary>
    /// 改期信息
    /// </summary>
    ChangeDetail: FlightChangeDetailEntity;// 
    /// <summary>
    /// 签转条件
    /// </summary>
    EndorsementDetail: FlightEndorsementDetailEntity;// 
    /// <summary>
    /// 备注
    /// </summary>
    Remark: string;// 
    /// <summary>
    /// 行李额
    /// </summary>
    BaggageAllowance: string;//  = "20KG";
}