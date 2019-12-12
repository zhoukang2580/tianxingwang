import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { TaskStatusType } from "src/app/workflow/models/TaskStatusType";
import { TaskType } from 'src/app/workflow/models/TaskType';
import { BaseVariablesEntity } from 'src/app/models/BaseVariablesEntity';
import { AccountEntity } from 'src/app/account/models/AccountEntity';

export class HistoryEntity extends BaseVariablesEntity {
  Task: TaskEntity;
  /// <summary>
  /// 账户
  /// </summary>
  Account: AccountEntity;
  /// <summary>
  /// 编号
  /// </summary>

  Key: string;
  /// <summary>
  /// 上一个审核任务
  /// </summary>
  PreviousKey: string;
  /// <summary>
  /// 下一个审核任务
  /// </summary>
  NextKey: string;
  /// <summary>
  /// 编号
  /// </summary>

  Number: string;
  /// <summary>
  /// 级别
  /// </summary>
  Level: string;
  /// <summary>
  /// 状态
  /// </summary>
  Type: TaskType;
  /// <summary>
  /// 状态
  /// </summary>
  Status: TaskStatusType;
  /// <summary>
  /// 超时时间
  /// </summary>
  CreateTime: string;

  /// <summary>
  /// 处理时间
  /// </summary>
  HandleTime: string;
  /// <summary>
  /// 处理时间
  /// </summary>
  ExpiredTime: string;
  /// <summary>
  /// 处理时间
  /// </summary>
  RemindTime: string;
  /// <summary>
  /// 处理地址
  /// </summary>
  HandleUrl: string;
  /// <summary>
  /// 超时处理地址
  /// </summary>
  ExpiredUrl: string;
  /// <summary>
  ///
  /// </summary>
  RemindUrl: string;
  /// <summary>
  ///
  /// </summary>
  MessageUrl: string;
  /// <summary>
  /// 渠道
  /// </summary>
  Channel: string;
  /// <summary>
  /// 备注
  /// </summary>
  Remark: string;

  /// <summary>
  /// 状态
  /// </summary>
  StatusName: string;
}
