/// <summary>
/// 改签规则
/// </summary>
export class FlightChangeDetailEntity {
    // #region 起飞前描述
    Befores: string[];
    BeforeEns: string[];

    // #region 起飞后描述
    Afters: string[];

    AfterEns: string[];
    // #endregion
    Keys: { [key: string]: string };

}