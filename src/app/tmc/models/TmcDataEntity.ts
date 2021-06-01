import { TmcEntity } from '../tmc.service';
import { HrEntity } from 'src/app/hr/hr.service';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class TmcDataEntity extends BaseVariablesEntity {
    /// <summary>
    /// 账户
    /// </summary>
    Tmc: TmcEntity;
    /// <summary>
    /// 账户
    /// </summary>
    Hr: HrEntity;
    /// <summary>
    /// 账户
    /// </summary>
    Cms: any;
    /// <summary>
    /// 账户
    /// </summary>
    Finance: any// FinanceEntity;

    /// <summary>
    /// 账户
    /// </summary>
    Workflow: any;//WorkflowEntity;

    /// <summary>
    /// 中文名称
    /// </summary>
    Name: string;
    /// <summary>
    /// 简称
    /// </summary>
    Nickname: string;
    /// <summary>
    /// 联系人
    /// </summary>
    Linkman: string;
    /// <summary>
    /// 联系号码
    /// </summary>
    Telephone: string;
    /// <summary>
    /// 邮编
    /// </summary>
    Postcode: string;
    /// <summary>
    /// 地址
    /// </summary>
    Address: string;
    /// <summary>
    /// 备注
    /// </summary>
    Remark: string;
    /// <summary>
    /// 政策说明
    /// </summary>
    Policy: string;
    /// <summary>
    /// 热线
    /// </summary>
    Hotline: string;

    /// <summary>
    /// 开始日期
    /// </summary>
    BeginDate: string;
    /// <summary>
    /// 截止日期
    /// </summary>
    EndDate: string;
    /// <summary>
    /// 飞机订票专员
    /// </summary>
    FlightHotline: string;
    /// <summary>
    /// 火车订票专员
    /// </summary>
    TrainHotline: string;
    /// <summary>
    /// 酒店预订专员
    /// </summary>
    HotelHotline: string;
    /// <summary>
    ///销售经理热线
    /// </summary>
    MangerHotline: string;
    /// <summary>
    ///客服经理热线
    /// </summary>
    CustomerHotline: string;
    /// <summary>
    ///紧急直线
    /// </summary>
    EmergencyHotline: string;
    /// <summary>
    ///驻场电话
    /// </summary>
    FieldHotline: string;


}