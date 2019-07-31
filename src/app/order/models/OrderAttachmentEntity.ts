import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { OrderEntity } from "./OrderEntity";

export class OrderAttachmentEntity extends BaseVariablesEntity {
  /// <summary>
  /// 总订单标识Id
  /// </summary>
  public Order: OrderEntity;
  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 关键字
  /// </summary>
  Key: string;

  /// <summary>
  /// 附件名称（标题）
  /// </summary>
  Name: string;
  /// <summary>
  /// 编号
  /// </summary>
  Number: string;
  /// <summary>
  /// 附件路径
  /// </summary>
  FileName: string;
  /// <summary>
  /// 图片全路径
  /// </summary>
  FullFileName: string;
  /// <summary>
  /// 附件文件流
  /// </summary>
  FileByte: any[];
  /// <summary>
  /// 得到文件全路径
  /// </summary>
  DownFileUrl: string;
}
