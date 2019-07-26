import { BaseVariablesEntity } from "src/app/tmc/models/BaseVariablesEntity";

export class BrandEntity extends BaseVariablesEntity {
  /// <summary>
  /// 语言
  /// </summary>
  Lang: string;

  /// <summary>
  /// 标签
  /// </summary>
  Tag: string;
  /// <summary>
  /// 名称
  /// </summary>
  Name: string;

  Pinyin: string;
  /// <summary>
  ///
  /// </summary>
  Initial: string;

  /// <summary>
  /// 排序
  /// </summary>
  Sequence: number;

  IsSearch: boolean;
  /// <summary>
  ///
  /// </summary>
  Langs: BrandLangEntity[];
}
export class BrandLangEntity {
  Brand: BrandEntity;
  /// <summary>
  /// 语言
  /// </summary>
  Lang: string;

  /// <summary>
  /// 名称
  /// </summary>
  Name: string;

  Pinyin: string;
  /// <summary>
  ///
  /// </summary>
  Initial: string;
}
