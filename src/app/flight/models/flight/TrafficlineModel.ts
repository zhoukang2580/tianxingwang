export class TrafficlineModel {
  Id: number; // long
  Tag: string; //  标签（Airport 机场，AirportCity 机场城市，Train 火车 站）
  Code: string; //  代码（三字码）
  Name: string; //  名称
  Nickname: string; //  简称
  Pinyin: string; //  拼音
  Initial: string; //  拼音简写
  AirportCityCode: string; //  机场城市代码（航空系统特有）
  CityCode: string; //  城市代码
  CityName: string; //  城市名称
  Description: string; //  描述
  IsHot: boolean; //  热点描述
  CountryCode: string; //  国籍代码
  Sequence: number; //  排序号
  EnglishName: string; //  英文名称
}
