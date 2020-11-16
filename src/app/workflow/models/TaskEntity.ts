import { TaskType } from "./TaskType";
import { TaskStatusType } from "./TaskStatusType";
import { HistoryEntity } from "src/app/order/models/HistoryEntity";
import { BaseVariablesEntity } from "src/app/models/BaseVariablesEntity";
import { BaseEntity } from "src/app/models/BaseEntity";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { TravelFormEntity } from 'src/app/tmc/tmc.service';

export class TaskEntity extends BaseVariablesEntity {

  Consumer: BaseEntity;
  
  TravelForms: TravelFormEntity[];
  /// <summary>
  /// 用户
  /// </summary>
  Account: AccountEntity;
  Title: string;
  imageStatus:"isOverdue"|"isRejected"|"isPassed"|"isClosed";

  /// <summary>
  ///名称
  /// </summary>
  Name: string;

  Applicant: string;

  ApplicationTime: string;

  TravelTime: string;

  CheckInCity: string;

  ConsumerId: string;

  DayCount: string;

  Trip: string;

  OrderId: string;

  IsOverdue: boolean;

  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  OrderTypeName: string;
  /// <summary>
  /// 级别
  /// </summary>
  Level: string;
  /// <summary>
  /// 数据
  /// </summary>
  Number: string;
  /// <summary>
  /// 当前任务
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
  /// 超时时间
  /// </summary>
  ExpiredTime: string;
  /// <summary>
  ///
  /// </summary>
  RemindTime: string;
  /// <summary>
  /// 是否处理
  /// </summary>
  public Status: TaskStatusType;
  /// <summary>
  /// 类型
  /// </summary>
  public Type: TaskType;
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

  StatusName: string;
  TypeName: string;

  /// <summary>
  /// 原数据
  /// </summary>
  public DataEntity: TaskEntity;
  /// <summary>
  /// 历史记录
  /// </summary>
  public History: HistoryEntity;
  /// <summary>
  /// 新任务
  /// </summary>
  PreviousTasks: TaskEntity[];
  /// <summary>
  /// 新任务
  /// </summary>
  NextTasks: TaskEntity[];
  /// <summary>
  /// 所有任务
  /// </summary>
  Tasks: TaskEntity[];
  /// <summary>
  /// 所有任务
  /// </summary>
  Histories: HistoryEntity[];
  Url: string;
}
