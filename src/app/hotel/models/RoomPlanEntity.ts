import { RoomPlanItemLangEntity } from "./RoomPlanItemLangEntity";
import { RoomPlanPriceEntity } from "./RoomPlanPriceEntity";
import { RoomPlanItemEntity } from "./RoomPlanItemEntity";
import { HotelBookType } from "./HotelBookType";
import { HotelPaymentType } from "./HotelPaymentType";
import { HotelSupplierType } from "./HotelSupplierType";
import { RoomEntity } from "./RoomEntity";
import { RoomPlanRuleEntity } from "./RoomPlanRuleEntity";

export class RoomPlanEntity {
  Variables: string;
  /// <summary>
  /// 房型
  /// </summary>
  Room: RoomEntity;
  /// <summary>
  /// 计划类型
  /// </summary>
  SupplierType: HotelSupplierType;
  /// <summary>
  /// 商品
  /// </summary>
  Name: string;
  /// <summary>
  /// 早餐
  /// </summary>
  Breakfast: number;
  /// <summary>
  /// 描述
  /// </summary>
  Description: string;
  /// <summary>
  /// 描述
  /// </summary>
  Number: string;
  /// <summary>
  /// 设施
  /// </summary>
  Facility: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  /// <summary>
  /// 货币代码
  /// </summary>
  CurrencyCode: string;
  /// <summary>
  /// 货币代码
  /// </summary>
  Invoice: string;
  /// <summary>
  /// 最新
  /// </summary>
  MinCount: number;
  /// <summary>
  /// 最小
  /// </summary>
  MinDays: number;
  /// <summary>
  /// 最多
  /// </summary>
  MaxDays: number;

  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsed: boolean;
  /// <summary>
  /// 价格计划
  /// </summary>
  PaymentType: HotelPaymentType;
  /// <summary>
  /// 开始日期
  /// </summary>
  BeginDate: string;
  /// <summary>
  /// 结束日期
  /// </summary>
  EndDate: string;

  /// <summary>
  /// 预订类型
  /// </summary>
  BookType: HotelBookType;

  /// <summary>
  /// 预订代码
  /// </summary>
  BookCode: string;

  /// <summary>
  /// 房型
  /// </summary>
  RoomPlanItems: RoomPlanItemEntity[];
  /// <summary>
  /// 房型
  /// </summary>
  RoomPlanRules: RoomPlanRuleEntity[];

  /// <summary>
  /// 价格
  /// </summary>
  RoomPlanPrices: RoomPlanPriceEntity[];

  /// <summary>
  /// 总金额
  /// </summary>
  TotalAmount: string;

  /// <summary>
  /// 是否启用
  /// </summary>
  IsUsedName: string;

  /// <summary>
  /// 是否允许预订
  /// </summary>
  IsAllowOrder: boolean;

  Rules: { [key: string]: string };

  DataEntity: RoomPlanEntity;

  Langs: RoomPlanItemLangEntity[];
}
