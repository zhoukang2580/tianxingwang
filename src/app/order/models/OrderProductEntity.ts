import { OrderItemEntity, OrderEntity } from "./OrderEntity";
import { OrderNumberEntity } from './OrderNumberEntity';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';

export class OrderProductEntity extends BaseVariablesEntity {
  /// <summary>
  /// 订单
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 编号
  /// </summary>
  Key: string;
  /// <summary>
  /// 编号
  /// </summary>
  GoodsNumber: string;
  /// <summary>
  /// 编号
  /// </summary>
  ProductNumber: string;
  /// <summary>
  /// 编号
  /// </summary>
  InventoryNumber: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;
  /// <summary>
  /// 价格
  /// </summary>
  Price: string;
  /// <summary>
  /// 成本
  /// </summary>
  Cost: string;
  /// <summary>
  /// 数量
  /// </summary>
  Count: number;

  /// <summary>
  /// 描述
  /// </summary>
  Description: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;
  /// <summary>
  /// 供应商
  /// </summary>
  Supplier: string;

  /// <summary>
  /// 供应商编码
  /// </summary>
  SupplierNumber: string;
  /// <summary>
  /// 图片名称
  /// </summary>
  FileName: string;
  /// <summary>
  /// 图片名称
  /// </summary>
  FullFileName: string;
  /// <summary>
  /// 图片流
  /// </summary>
  FileByte: any[];
  /// <summary>
  /// 订单编号
  /// </summary>
  OrderNumbers: OrderNumberEntity[];
  /// <summary>
  ///
  /// </summary>
  OrderItems: OrderItemEntity[];

  DataEntity: OrderProductEntity;
}
