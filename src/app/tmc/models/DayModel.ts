export class DayModel {
  day: string; // 第几号
  displayName: string;
  dayOfWeek?: number; // 星期几
  dayOfWeekName?: string; // 周一到周日
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "success"
    | "warning"
    | "danger"
    | "light"
    | "medium"
    | "dark"; // 显示的颜色
  date?: string; // 2018-9-16
  enabled?: boolean; // 是否启用,
  selected?: boolean; // 是否选中
  price?: number; // 价格
  dayoff?: boolean; // 休
  holiday?: string; // 节假日名称
  isToday?: boolean; // 是否是今天
  isBetweenDays?: boolean;
  isLastMonthDay?: boolean;
  firstSelected?: boolean;
  lastSelected?: boolean;
  timeStamp?: number; // 时间戳，用于比较两个时间的大小
  toolTipMsg?: string; // 给用户的提示信息
  hasToolTip?: boolean; // 是否给用户提示信息
  toolTipPos?: "start" | "center" | "end"; // 提示条的位置
  topDesc?: string; // 描述文字,比如酒店的入住，离店,机票的去程，返程
  bottomDesc?: string; // 描述文字,比如酒店的入住，离店,机票的去程，返程
  descColor?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "success"
    | "warning"
    | "danger"
    | "light"
    | "medium"
    | "dark";
  lunarInfo: ILunarInfo;
}
export interface ILunarInfo {
  year: number; // 2020
  month: number; // 1
  day: number; // 8
  zodiac: string; // "猪"
  GanZhiYear: string; // "己亥"
  GanZhiMonth: string; // "丁丑"
  GanZhiDay: string; // "庚戌"
  worktime: number; // 0
  term: string; // undefined
  lunarYear: number; // 2019
  lunarMonth: number; // 12
  lunarDay: number; // 14
  lunarMonthName: string; // "十二月"
  lunarDayName: string; // "十四"
  lunarLeapMonth: string; // 0
  solarFestival: string; // undefined
  lunarFestival: string; // 除夕
}
