import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";
import { HotelEntity } from './HotelEntity';

export class HotelDetailEntity extends BaseVariablesEntity {
  /// <summary>
  /// 酒店
  /// </summary>
  Hotel: HotelEntity;
  /// <summary>
  /// 语言版本
  /// </summary>
  Lang: string;

  /// <summary>
  /// 标签
  /// Hotel
  ///     Creditcards
  ///     IntroEditor
  ///     Description
  ///     AirportPickUpService
  ///     Traffic
  ///     Surroundings
  ///     Features
  /// </summary>
  Tag: string;
  /// <summary>
  ///
  /// </summary>
  Number: string;
  /// <summary>
  /// Creditcards 酒店支持的信用卡
  /// IntroEditor 简介
  /// Description 描述
  /// AirportPickUpService 接机服务
  /// Traffic 周边交通
  /// Surroundings 周边信息
  /// Features 特色信息
  /// </summary>
  Name: string;

  /// <summary>
  /// 描述
  /// </summary>
  Description: string;
}
