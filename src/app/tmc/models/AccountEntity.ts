export class AccountEntity {
    Id:string;
    /// <summary>
    /// 用户名
    /// </summary>
    Name: string;// 
    /// <summary>
    /// 密码
    /// </summary>
    Password: string;// 
    /// <summary>
    /// 支付密码
    /// </summary>
    Payword: string;// 
    /// <summary>
    /// 真实姓名
    /// </summary>
    RealName: string;// 
    /// <summary>
    /// 手机号码
    /// </summary>
    Mobile: string;// 
    /// <summary>
    /// 邮箱
    /// </summary>
    Email: string;// 
    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsed: boolean;// 
    /// <summary>
    /// 是否激活手机
    /// </summary>
    IsActiveMobile: boolean;// 
    /// <summary>
    /// 是否激活邮箱
    /// </summary>
    IsActiveEmail: boolean;// 
    /// <summary>
    /// 是否实名
    /// </summary>
    IsReality: boolean;// 

    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsedName: string;
    /// <summary>
    /// 是否激活手机
    /// </summary>
    IsActiveMobileName: string;
    /// <summary>
    /// 是否激活邮箱
    /// </summary>
    IsActiveEmailName: string;
    /// <summary>
    /// 是否激活邮箱
    /// </summary>
    IsRealityName: string;


    /// <summary>
    /// 账户编号
    /// </summary>
    // public virtual IList<AccountSetupEntity>
    AccountSetups: any;// 
    /// <summary>
    /// 账户编号
    /// </summary>
    // public virtual IList<AccountNumberEntity> 
    AccountNumbers: any;// 
    /// <summary>
    /// 身份信息
    /// </summary>
    // public virtual IList<AccountIdentityEntity> 
    AccountIdentites: any;//string;// 
    /// <summary>
    /// 身份信息
    /// </summary>
    // public virtual IList<AccountCardEntity> 
    AccountCards: any;//string;// 
    /// <summary>
    /// 身份信息
    /// </summary>
    // public virtual IList<AccountTagEntity> 
    AccountTags: any;//string;// 
    /// <summary>
    /// 身份信息
    /// </summary>
    // public virtual IList<AccountBalanceEntity> 
    AccountBalances: any;//string;// 

    /// <summary>
    /// 身份信息
    /// </summary>
    // public virtual IList<AccountTokenEntity>
    AccountTokens: any;//string;// 
}