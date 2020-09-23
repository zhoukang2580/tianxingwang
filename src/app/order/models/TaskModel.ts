import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { OrderEntity } from "./OrderEntity";
import { HistoryEntity } from "./HistoryEntity";
import { TmcEntity } from "src/app/tmc/tmc.service";

export class TaskModel {
  /// <summary>
  /// 当前页
  /// </summary>
  PageIndex: number;
  Type: number;
  /// <summary>
  /// 分页大小
  /// </summary>
  PageSize;

  /// <summary>
  /// 页大小
  /// </summary>

  /// <summary>
  /// 页大小
  /// </summary>
  PageCount: number;

  /// <summary>
  /// 数据
  /// </summary>
  DataCount: number;
  /// <summary>
  /// 订单
  /// </summary>
  Tasks: TaskEntity[];
  /// <summary>
  /// 订单
  /// </summary>
  Order: OrderEntity;
  /// <summary>
  /// 当前任务
  /// </summary>
  Task: TaskEntity;
  /// <summary>
  /// 审批记录
  /// </summary>
  Histories: HistoryEntity[];
  /// <summary>
  ///
  /// </summary>
  Tmc: TmcEntity;
}
