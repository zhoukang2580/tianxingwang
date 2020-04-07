import { AgentSmsType } from './AgentSmsType';
import { FlightSupplierType } from '../../flight/models/flight/FlightSupplierType';
import { TrainSupplierType } from 'src/app/train/models/TrainSupplierType';
import { InsuranceSupplierType } from 'src/app/insurance/models/InsuranceSupplierType';
import { HotelSupplierType } from 'src/app/hotel/models/HotelSupplierType';
import { AccountEntity } from 'src/app/account/models/AccountEntity';

export class AgentEntity {
    /// <summary>
    /// 账户
    /// </summary>
    Account: AccountEntity;// 
    /// <summary>
    /// 名称
    /// </summary>
    Name: string;// 

    /// <summary>
    /// 图标路径
    /// </summary>
    FaviconFileName: string;// 
    /// <summary>
    /// logo地址
    /// </summary>

    LogoFileName: string;// 
    /// <summary>
    /// 图标路径
    /// </summary>
    LogoFullFileName: string;
    /// <summary>
    /// 文件流
    /// </summary>
    LogoFileByte: any[];// 
    /// <summary>
    /// 图标路径
    /// </summary>
    FaviconFullFileName: string;
    /// <summary>
    /// 文件流
    /// </summary>
    FaviconFileByte: any[];// 
    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsed: boolean;// 
    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsedName: string;
    HasHoldPnr: boolean;


    // #region 费用配置
    FlightSettlePrice: string;

    TrainSettlePrice: string;
    HotelSettlePrice: string;
    // #region 邮件配置
    SmtpDisplayName: string;
    SmtpHost: string;
    SmtpUserName: string;
    SmtpPassword: string;
    SmtpFromMail: string;

    SmtpPort: string;
    SmtpEnableSsl: boolean;


    // #region 支付宝配置
    AliAppId: string;
    AliPrivateKey: string;
    AliPayKey: string;

    AliPayFee: string;

    // #region 快钱支付配置
    QuickMerchantId: string;
    QuickPrivateCertPassword: string;
    QuickPrivateCertFileName: string;

    QuickCertFileName: string;

    QuickPayFee: string;

    // #region 微信支付配置
    /// <summary>
    /// 绑定支付的APPID
    /// </summary>
    WechatAppId: string;
    /// <summary>
    /// 绑定支付的APPID
    /// </summary>
    WechatAppSecret: string;
    /// <summary>
    /// 绑定支付的APPID
    /// </summary>
    WechatMiniId: string;
    /// <summary>
    /// 绑定支付的APPID
    /// </summary>
    WechatMiniSecret: string;
    /// <summary>
    /// 绑定支付的APPID
    /// </summary>
    WechatSecretId: string;
    /// <summary>
    /// 商户号
    /// </summary>
    WechatMchId: string;
    /// <summary>
    /// 商户支付密钥，参考开户邮件设置
    /// </summary>
    WechatMchKey: string;
    WechatCertPath: string;
    WechatSecret: string;
    WechatToken: string;

    WechatOauthText: string;
    WechatPayFee: string;

    // #region XiaoAo短信配置
    SmsType: AgentSmsType;
    SmsUrl: string;
    SmsYiMeiUrl: string;
    SmsAliDaYuAppKey: string;

    SmsAliDaYuAppSecret: string;
    SmsAliDaYuSmsFreeSignName: string;
    SmsAliDaYuSmsType: string;
    SmsAliDaYuSmsTemplateCode: string;
    SmsXiAoUserId: string;
    SmsXiAoCorpCode: string;
    SmsXiAoPassword: string;

    // #region 机票配置
    /// <summary>
    /// ibeplus配置
    /// </summary>
    /// <example>
    /// </example>
    IbePlusConfig: string;
    /// <summary>
    /// eterm配置
    /// </summary>
    /// <example>
    /// { OfficeCode:'SHA396',}
    /// </example>
    EtermConfig: string;
    // #region 机票结算配置
    /// <summary>
    /// 东美参数 {Url:'',Username:'',Password:'',Department:18}
    /// </summary>
    FlightTicketSettlementParameter: string;

    // #region 钉钉配置
    /// <summary>
    /// 绑定支付的APPID
    /// </summary>
    DingAppId: string;

    /// <summary>
    /// 商户号
    /// </summary>
    DingAppSecret: string;



    /// <summary>
    /// 代理类型
    /// </summary>
    RegionType: string;

    RegionTypeName: string;

    /// <summary>
    /// 代理类型
    /// </summary>
    FlightSupplierType: string;

    FlightSupplierTypeName: string;

    /// <summary>
    /// 代理类型
    /// </summary>
    DefaultFlightSupplierType: FlightSupplierType;
    /// <summary>
    /// 代理类型
    /// </summary>
    TrainSupplierType: TrainSupplierType;
    /// <summary>
    /// 代理类型
    /// </summary>
    HotelSupplierType: HotelSupplierType;

    /// <summary>
    /// 代理类型
    /// </summary>
    InsuranceSupplierType: InsuranceSupplierType;

    Address: string;//;"上海肇嘉浜路376号轻工大厦3楼"
    HotelBookMobile:string;//; ""
    Id:number;// 10000
    Linkman:string;// "张俊"
    //Name: "上海东美在线旅行社有限公司"
    Nickname:string;// "东美在线"
    Postcode:string;// "200031"
    Remark: string;//
    Telephone:string;// "400-66-88868"
    LogoUrl:string;// "400-66-88868"

}