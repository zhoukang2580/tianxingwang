import { OrderStatusEnum } from "./flight/OrderStatusEnum";
import { TaskInfoModel } from "./TaskInfoMode";
export class TaskModel {
  PageIndex: number; // 页码
  PageSize: number; // 每页条数
  Status: OrderStatusEnum; // 订单状态
  DataCount: number; // 总数
  Tasks: Array<TaskInfoModel>; // 审批单
}
