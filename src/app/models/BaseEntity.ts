import { ErrorInfo } from "./ErrorInfo";

export class BaseEntity {
  /// <summary>
  /// 错误信息
  /// </summary>
  public Errors: ErrorInfo[];
  /// <summary>
  /// 验证是否通过
  /// </summary>
  public HandleResult: boolean;

  /// <summary>
  /// ID
  /// </summary>
  public Id: string;

  /// <summary>
  /// 添加时间
  /// </summary>
  public InsertTime: string;
  public InsertDateTime: string;

  /// <summary>
  /// 更新时间
  /// </summary>
  public UpdateTime: string;

  /// <summary>
  /// 版本
  /// </summary>
  public Version: string;
  public Language: string;
  public SaveType: SaveType;
}
export enum SaveType {
  /// <summary>
  /// 无操作
  /// </summary>
  None = 0,
  /// <summary>
  /// 添加
  /// </summary>
  Add = 1,
  /// <summary>
  /// 修改
  /// </summary>
  Modify = 2,
  /// <summary>
  /// 移除
  /// </summary>
  Remove = 4,
  /// <summary>
  /// 还原
  /// </summary>
  Restore = 8
}
