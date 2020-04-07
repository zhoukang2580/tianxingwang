import { FlightJourneyEntity } from './models/flight/FlightJourneyEntity';
import { FlightCabinType } from './models/flight/FlightCabinType';
import { FlightCabinFareType } from './models/flight/FlightCabinFareType';
import { FlightSupplierType } from './models/flight/FlightSupplierType';
import { FlightBookType } from './models/flight/FlightBookType';
import { InsuranceBookType } from '../insurance/models/InsuranceBookType';
import { OrderInsuranceType } from '../insurance/models/OrderInsuranceType';
import { InsuranceSupplierType } from '../insurance/models/InsuranceSupplierType';
import { AgentSmsType } from '../tmc/models/AgentSmsType';
import { TrainSupplierType } from '../train/models/TrainSupplierType';
import { HotelSupplierType } from '../hotel/models/HotelSupplierType';
import * as moment from 'moment';
export class TestTmcData {
    static getFlightData = () => [
        {
            /// <summary>
            /// 旅行日期
            /// </summary>
            Date: "旅行日期",

            /// <summary>
            /// 星期
            /// </summary>
            Week: "星期五",

            /// <summary>
            /// 出发城市
            /// </summary>
            FromCity: "出发城市",
            /// <summary>
            /// 到达城市
            /// </summary>
            ToCity: "到达城市",
            /// <summary>
            /// 航段信息
            /// </summary>
            FlightRoutes: [
                {
                    /// <summary>
                    /// 首航班起飞时间
                    /// </summary>
                    FirstTime: `${moment().add(-200, 'minutes').format("YYYY-MM-DDTHH:mm:ss")}`,
                    /// <summary>
                    /// 航班信息
                    /// </summary>
                    FlightSegments: [
                        {
                            /// <summary>
                            /// 航班最低价
                            /// </summary>
                            LowestFare: `${500 + Math.random() * 1000}`,
                            /// <summary>
                            /// 航班最低价舱位
                            /// </summary>
                            LowestCabinCode: "航班最低价舱位",
                            /// <summary>
                            /// 航班最低价舱位折扣
                            /// </summary>
                            LowestDiscount: "航班最低价舱位折扣",
                            /// <summary>
                            /// 航班最低价舱位类型
                            /// </summary>
                            LowestCabinType: FlightCabinType.DiscountF,
                            /// <summary>
                            /// 最低价舱位价格类型
                            /// </summary>
                            LowestCabinFareType: FlightCabinFareType.Official,
                            /// <summary>
                            /// 机场税收
                            /// </summary>
                            Tax: "机场税收",
                            /// <summary>
                            /// 经济舱全价
                            /// </summary>
                            YFare: "经济舱全价",
                            /// <summary>
                            /// 公务舱全价
                            /// </summary>
                            CFare: "公务舱全价",
                            /// <summary>
                            /// 头等舱全价
                            /// </summary>
                            FFare: "头等舱全价",
                            /// <summary>
                            /// 航班号
                            /// </summary>
                            Number: "航班号",
                            /// <summary>
                            ///航空公司
                            /// </summary>
                            Airline: "航空公司",
                            /// <summary>
                            /// 航空公司名称
                            /// </summary>
                            AirlineName: `${["航空公司名称", "AAA航空公司名称", "BA航空公司名称AAA航空公司名称", "aaacccAAA航空公司名称", "AAA航空公司名称zzzz"]
                            [Math.floor(Math.random() * 5)]}`,
                            /// <summary>
                            /// 机型
                            /// </summary>
                            PlaneType: "机型",
                            /// <summary>
                            /// 机型描述
                            /// </summary>
                            PlaneTypeDescribe: "机型描述",
                            /// <summary>
                            /// 代码共享实际承运航班号
                            /// </summary>
                            CodeShareNumber: "代码共享实际承运航班号",
                            /// <summary>
                            /// 承运
                            /// </summary>
                            Carrier: "承运",
                            /// <summary>
                            /// 承运名称
                            /// </summary>
                            CarrierName: "承运名称",
                            /// <summary>
                            /// 出发机场
                            /// </summary>
                            FromAirport: "出发机场",
                            /// <summary>
                            /// 到达机场
                            /// </summary>
                            ToAirport: "到达机场",
                            /// <summary>
                            /// 出发机场
                            /// </summary>
                            FromAirportName: "FromAirportName",
                            /// <summary>
                            /// 出发机场
                            /// </summary>
                            FromCityName: "北京国际机场",
                            /// <summary>
                            /// 到达机场
                            /// </summary>
                            ToAirportName: "上海虹桥",
                            /// <summary>
                            /// 到达机场
                            /// </summary>
                            ToCityName: "ToCityName",
                            /// <summary>
                            /// 起飞时间
                            /// </summary>
                            TakeoffTime: `${moment().add((Math.floor(Math.random() * 2) <= 0 ? -1 : 1) * Math.random() * 5, 'hours').add(Math.random() * 100, 'minutes').format("YYYY-MM-DDTHH:mm:ss")}`,
                            /// <summary>
                            /// 到达时间
                            /// </summary>
                            ArrivalTime: `${moment().add(6, 'hours').add(Math.random() * 100, 'minutes').format("YYYY-MM-DDTHH:mm:ss")}`,
                            /// <summary>
                            /// 始发航站楼
                            /// </summary>
                            FromTerminal: "始发航站楼",
                            /// <summary>
                            /// 到达航站楼
                            /// </summary>
                            ToTerminal: "到达航站楼",
                            /// <summary>
                            /// 是否经停
                            /// 经停 True
                            /// 直飞 False
                            /// </summary>
                            IsStop: false,
                            //Normal价
                            BasicPrice: "Normal价",
                            //前后航班最低价
                            LowerPrice: "前后航班最低价",
                            //前后最低价航班
                            LowerFlightNumber: "前后最低价航班",
                            //当前航班最低价
                            CurrentLowestFare: "当前航班最低价",
                            //退政策
                            RefundRule: "退政策",
                            //改政策
                            ChangeRule: "改政策",
                            //Ei政策
                            EiRule: "Ei政策",
                            /// <summary>
                            /// 经停城市
                            /// </summary>
                            StopCities: [
                                {
                                    /// <summary>
                                    /// 经停机场代码
                                    /// </summary>
                                    AirportCode: "经停机场代码",
                                    /// <summary>
                                    /// 经停机场名称
                                    /// </summary>
                                    AirportName: "经停机场名称",
                                    /// <summary>
                                    /// 经停城市名称
                                    /// </summary>
                                    CityName: "经停城市名称",
                                    /// <summary>
                                    /// 到达时间（先）
                                    /// </summary>
                                    ArriveTime: `${moment().add(100 * Math.random(), 'minutes').format("YYYY-MM-DDTHH:mm:ss")}`,
                                    /// <summary>
                                    /// 起飞时间（后）
                                    /// </summary>
                                    TakeoffTime: `${moment().add(60 + 25 + 30, 'minutes').format("YYYY-MM-DDTHH:mm:ss")}`,
                                    /// <summary>
                                    /// 获得经停时间
                                    /// 2h30m
                                    /// </summary>
                                    /// <returns></returns>
                                    StayTime: `${Math.floor(Math.random() * 10)}h${Math.floor(Math.random() * 100)}`
                                }
                            ],
                            /// <summary>
                            /// 变量数据
                            /// </summary>
                            Variables: {},
                            /// <summary>
                            /// 飞行距离
                            /// </summary>
                            Distance: "1875",
                            /// <summary>
                            /// 获得飞行时间
                            /// </summary>
                            /// <returns></returns>
                            FlyTime: `${moment().add(Math.floor(Math.random() * 130), 'minutes').format("YYYY-MM-DDTHH:mm:ss")}`,
                            FlyTimeName: `${Math.floor(Math.random() * 10)}h${Math.floor(Math.random() * 100)}`,
                            /// <summary>
                            /// 舱位
                            /// </summary>
                            Cabins: [{
                                BookType: FlightBookType.Ibe,
                                BookCode: "BookCode",
                                /// <summary>
                                /// 航班号
                                /// </summary>
                                FlightNumber: "航班号",
                                /// <summary>
                                /// z
                                /// </summary>
                                PolicyId: "PolicyId",
                                /// <summary>
                                /// 来源
                                /// </summary>
                                SupplierType: FlightSupplierType.Eterm,
                                /// <summary>
                                /// 价格类型
                                /// </summary>
                                /// <seealso cref="FlightCabinFareType"/>
                                FareType: FlightCabinFareType.Agreement,
                                /// <summary>
                                /// 名称
                                /// </summary>
                                Name: "名称",
                                /// <summary>
                                /// 舱位类型
                                /// </summary>
                                /// <see cref="FlightCabinType"/>
                                Type: FlightCabinType.SeniorY,
                                /// <summary>
                                /// 舱位代码
                                /// </summary>
                                Code: "舱位代码",
                                /// <summary>
                                /// 票面价格
                                /// </summary>
                                TicketPrice: "票面价格",
                                /// <summary>
                                /// 结算价格
                                /// </summary>
                                SettlePrice: "结算价格",
                                /// <summary>
                                /// 售价
                                /// </summary>
                                SalesPrice: "售价",

                                /// <summary>
                                /// 税收
                                /// </summary>
                                Tax: "税收",
                                /// <summary>
                                /// 税收
                                /// </summary>
                                SettleTax: "税收",
                                /// <summary>
                                /// 航段返利
                                /// </summary>
                                Reward: "航段返利",
                                /// <summary>
                                /// 折扣
                                /// </summary>
                                Discount: "折扣",
                                /// <summary>
                                /// 数量
                                /// </summary>
                                Count: "数量",
                                /// <summary>
                                /// 变量体
                                /// </summary>
                                Variables: {},
                                /// <summary>
                                /// 退改签规则
                                /// </summary>
                                RefundChange: {
                                    Airline: "",
                                    Cabin: "",
                                    /// <summary>
                                    /// 退票信息
                                    /// </summary>
                                    RefundDetail: {
                                        //起飞前描述
                                        Befores: [],
                                        BeforeEns: [],
                                        //#endregion
                                        //#region 起飞后描述
                                        //private List<string> _afters = new List<string>(),
                                        Afters: [],
                                        // private List<string> _afterEns = new List<string>(),
                                        AfterEns: [],
                                        // #endregion
                                        Keys: {},

                                    },
                                    /// <summary>
                                    /// 改期信息
                                    /// </summary>
                                    ChangeDetail: {
                                        // #region 起飞前描述
                                        Befores: [],
                                        BeforeEns: [],
                                        // #region 起飞后描述
                                        Afters: [],

                                        AfterEns: [],
                                        // #endregion
                                        Keys: {}
                                    },
                                    /// <summary>
                                    /// 签转条件
                                    /// </summary>
                                    EndorsementDetail: { Endorsements: [] },
                                    /// <summary>
                                    /// 备注
                                    /// </summary>
                                    Remark: "",
                                    /// <summary>
                                    /// 行李额
                                    /// </summary>
                                    BaggageAllowance: "",
                                },
                                /// <summary>
                                /// 政策
                                /// </summary>
                                FlightPolicy: {
                                    /// <summary>
                                    /// 代理
                                    /// </summary>
                                    Agent: {
                                        /// <summary>
                                        /// 账户
                                        /// </summary>
                                        Account: {
                                            /// <summary>
                                            /// 用户名
                                            /// </summary>
                                            Name: ``,
                                            /// <summary>
                                            /// 密码
                                            /// </summary>
                                            Password: ``,
                                            /// <summary>
                                            /// 支付密码
                                            /// </summary>
                                            Payword: ``,
                                            /// <summary>
                                            /// 真实姓名
                                            /// </summary>
                                            RealName: ``,
                                            /// <summary>
                                            /// 手机号码
                                            /// </summary>
                                            Mobile: ``,
                                            /// <summary>
                                            /// 邮箱
                                            /// </summary>
                                            Email: ``,
                                            /// <summary>
                                            /// 是否启用
                                            /// </summary>
                                            IsUsed: true,
                                            /// <summary>
                                            /// 是否激活手机
                                            /// </summary>
                                            IsActiveMobile: true,
                                            /// <summary>
                                            /// 是否激活邮箱
                                            /// </summary>
                                            IsActiveEmail: true,
                                            /// <summary>
                                            /// 是否实名
                                            /// </summary>
                                            IsReality: true,

                                            /// <summary>
                                            /// 是否启用
                                            /// </summary>
                                            IsUsedName: "",
                                            /// <summary>
                                            /// 是否激活手机
                                            /// </summary>
                                            IsActiveMobileName: "",
                                            /// <summary>
                                            /// 是否激活邮箱
                                            /// </summary>
                                            IsActiveEmailName: "",
                                            /// <summary>
                                            /// 是否激活邮箱
                                            /// </summary>
                                            IsRealityName: "",


                                            /// <summary>
                                            /// 账户编号
                                            /// </summary>
                                            // public virtual IList<AccountSetupEntity>
                                            AccountSetups: [],// 
                                            /// <summary>
                                            /// 账户编号
                                            /// </summary>
                                            // public virtual IList<AccountNumberEntity> 
                                            AccountNumbers: [],// 
                                            /// <summary>
                                            /// 身份信息
                                            /// </summary>
                                            // public virtual IList<AccountIdentityEntity> 
                                            AccountIdentites: [],//``, 
                                            /// <summary>
                                            /// 身份信息
                                            /// </summary>
                                            // public virtual IList<AccountCardEntity> 
                                            AccountCards: [],//``, 
                                            /// <summary>
                                            /// 身份信息
                                            /// </summary>
                                            // public virtual IList<AccountTagEntity> 
                                            AccountTags: [],//``, 
                                            /// <summary>
                                            /// 身份信息
                                            /// </summary>
                                            // public virtual IList<AccountBalanceEntity> 
                                            AccountBalances: [],//``, 

                                            /// <summary>
                                            /// 身份信息
                                            /// </summary>
                                            // public virtual IList<AccountTokenEntity>
                                            AccountTokens: [],//``, 

                                            ModifyMobileEvent: `Beeant.Domain.Entities.Account.Account.ModifyMobile`,
                                            ModifyEmailEvent: `Beeant.Domain.Entities.Account.Account.ModifyEmail`,
                                        },
                                        /// <summary>
                                        /// 名称
                                        /// </summary>
                                        Name: "",

                                        /// <summary>
                                        /// 图标路径
                                        /// </summary>
                                        FaviconFileName: "",
                                        /// <summary>
                                        /// logo地址
                                        /// </summary>

                                        LogoFileName: "",
                                        /// <summary>
                                        /// 图标路径
                                        /// </summary>
                                        LogoFullFileName: "",
                                        /// <summary>
                                        /// 文件流
                                        /// </summary>
                                        LogoFileByte: [],
                                        /// <summary>
                                        /// 图标路径
                                        /// </summary>
                                        FaviconFullFileName: "",
                                        /// <summary>
                                        /// 文件流
                                        /// </summary>
                                        FaviconFileByte: [],
                                        /// <summary>
                                        /// 是否启用
                                        /// </summary>
                                        IsUsed: true,
                                        /// <summary>
                                        /// 是否启用
                                        /// </summary>
                                        IsUsedName: "",
                                        HasHoldPnr: true,


                                        // #region 费用配置
                                        FlightSettlePrice: "",

                                        TrainSettlePrice: "",
                                        HotelSettlePrice: "",
                                        // #region 邮件配置
                                        SmtpDisplayName: "",
                                        SmtpHost: "",
                                        SmtpUserName: "",
                                        SmtpPassword: "",
                                        SmtpFromMail: "",

                                        SmtpPort: "",
                                        SmtpEnableSsl: true,


                                        // #region 支付宝配置
                                        AliAppId: "",
                                        AliPrivateKey: "",
                                        AliPayKey: "",

                                        AliPayFee: "",

                                        // #region 快钱支付配置
                                        QuickMerchantId: "",
                                        QuickPrivateCertPassword: "",
                                        QuickPrivateCertFileName: "",

                                        QuickCertFileName: "",

                                        QuickPayFee: "",

                                        // #region 微信支付配置
                                        /// <summary>
                                        /// 绑定支付的APPID
                                        /// </summary>
                                        WechatAppId: "",
                                        /// <summary>
                                        /// 绑定支付的APPID
                                        /// </summary>
                                        WechatAppSecret: "",
                                        /// <summary>
                                        /// 绑定支付的APPID
                                        /// </summary>
                                        WechatMiniId: "",
                                        /// <summary>
                                        /// 绑定支付的APPID
                                        /// </summary>
                                        WechatMiniSecret: "",
                                        /// <summary>
                                        /// 绑定支付的APPID
                                        /// </summary>
                                        WechatSecretId: "",
                                        /// <summary>
                                        /// 商户号
                                        /// </summary>
                                        WechatMchId: "",
                                        /// <summary>
                                        /// 商户支付密钥，参考开户邮件设置
                                        /// </summary>
                                        WechatMchKey: "",
                                        WechatCertPath: "",
                                        WechatSecret: "",
                                        WechatToken: "",

                                        WechatOauthText: "",
                                        WechatPayFee: "",

                                        // #region XiaoAo短信配置
                                        SmsType: AgentSmsType.Default,
                                        SmsUrl: "",
                                        SmsYiMeiUrl: "",
                                        SmsAliDaYuAppKey: "",

                                        SmsAliDaYuAppSecret: "",
                                        SmsAliDaYuSmsFreeSignName: "",
                                        SmsAliDaYuSmsType: "",
                                        SmsAliDaYuSmsTemplateCode: "",
                                        SmsXiAoUserId: "",
                                        SmsXiAoCorpCode: "",
                                        SmsXiAoPassword: "",

                                        // #region 机票配置
                                        /// <summary>
                                        /// ibeplus配置
                                        /// </summary>
                                        /// <example>
                                        /// </example>
                                        IbePlusConfig: "",
                                        /// <summary>
                                        /// eterm配置
                                        /// </summary>
                                        /// <example>
                                        /// { OfficeCode:'SHA396',}
                                        /// </example>
                                        EtermConfig: "",
                                        // #region 机票结算配置
                                        /// <summary>
                                        /// 东美参数 {Url:'',Username:'',Password:'',Department:18}
                                        /// </summary>
                                        FlightTicketSettlementParameter: "",

                                        // #region 钉钉配置
                                        /// <summary>
                                        /// 绑定支付的APPID
                                        /// </summary>
                                        DingAppId: "",

                                        /// <summary>
                                        /// 商户号
                                        /// </summary>
                                        DingAppSecret: "",



                                        /// <summary>
                                        /// 代理类型
                                        /// </summary>
                                        RegionType: "",

                                        RegionTypeName: "",

                                        /// <summary>
                                        /// 代理类型
                                        /// </summary>
                                        FlightSupplierType: "",

                                        FlightSupplierTypeName: "",

                                        /// <summary>
                                        /// 代理类型
                                        /// </summary>
                                        DefaultFlightSupplierType: FlightSupplierType.Eterm,
                                        /// <summary>
                                        /// 代理类型
                                        /// </summary>
                                        TrainSupplierType: TrainSupplierType.HangTian,
                                        /// <summary>
                                        /// 代理类型
                                        /// </summary>
                                        HotelSupplierType: HotelSupplierType.Group,

                                        /// <summary>
                                        /// 代理类型
                                        /// </summary>
                                        InsuranceSupplierType: InsuranceSupplierType.Platform,

                                    },
                                    /// <summary>
                                    /// 名称
                                    /// </summary>
                                    Name: "",

                                    /// <summary>
                                    /// 航公公司
                                    /// </summary>
                                    Airline: "",

                                    /// <summary>
                                    /// 规则管理
                                    /// </summary>
                                    Route: "",

                                    /// <summary>
                                    /// 不启用
                                    /// </summary>
                                    UnRoute: "",

                                    /// <summary>
                                    /// 航班
                                    /// </summary>
                                    Flights: "",

                                    /// <summary>
                                    /// 禁止航班
                                    /// </summary>
                                    UnFlights: "",

                                    /// <summary>
                                    /// 舱位
                                    /// </summary>
                                    Cabins: "",

                                    /// <summary>
                                    /// 起飞时段
                                    /// </summary>
                                    FlightDate: "",

                                    /// <summary>
                                    /// 禁止时段
                                    /// </summary>
                                    UnFlightDate: "",

                                    /// <summary>
                                    /// 禁止时段
                                    /// </summary>
                                    IssueStartDate: "",

                                    /// <summary>
                                    /// 禁止时段
                                    /// </summary>
                                    IssueEndDate: "",

                                    /// <summary>
                                    /// 开始时间
                                    /// </summary>
                                    StartDate: "",

                                    /// <summary>
                                    /// 结束时间
                                    /// </summary>
                                    EndDate: "",

                                    /// <summary>
                                    /// 获得返利
                                    /// </summary>
                                    GainRate: "",

                                    /// <summary>
                                    /// 返给客户返利
                                    /// </summary>
                                    PayRate: "",

                                    /// <summary>
                                    /// 是否启用
                                    /// </summary>
                                    IsUsed: true,
                                    /// <summary>
                                    /// 是否强制执行
                                    /// </summary>
                                    IsForced: false,
                                    /// <summary>
                                    /// 是否启用
                                    /// </summary>
                                    IsUsedName: "",
                                    /// <summary>
                                    /// 航班日期
                                    /// </summary>
                                    FlightDateArray: [],



                                    /// <summary>
                                    /// 航班日期
                                    /// </summary>
                                    UnFlightDateArray: [],



                                    /// <summary>
                                    /// 航班
                                    /// </summary>
                                    FlightArray: [],


                                    /// <summary>
                                    /// 航班
                                    /// </summary>
                                    UnFlightArray: [],


                                    /// <summary>
                                    /// 舱位
                                    /// </summary>
                                    CabinArray: [],



                                    /// <summary>
                                    /// 规则
                                    /// </summary>
                                    RouteArray: [],



                                    /// <summary>
                                    /// 规则
                                    /// </summary>
                                    UnRouteArray: [],
                                },
                                /// <summary>
                                /// 低价航班
                                /// </summary>
                                LowerSegment: {
                                    /// <summary>
                                    /// 航班最低价
                                    /// </summary>
                                    LowestFare: "航班最低价",
                                    /// <summary>
                                    /// 航班最低价舱位
                                    /// </summary>
                                    LowestCabinCode: "航班最低价舱位",
                                    /// <summary>
                                    /// 航班最低价舱位折扣
                                    /// </summary>
                                    LowestDiscount: "航班最低价舱位折扣",
                                    /// <summary>
                                    /// 航班最低价舱位类型
                                    /// </summary>
                                    LowestCabinType: FlightCabinType.DiscountF,
                                    /// <summary>
                                    /// 最低价舱位价格类型
                                    /// </summary>
                                    LowestCabinFareType: FlightCabinFareType.Net,
                                    /// <summary>
                                    /// 机场税收
                                    /// </summary>
                                    Tax: "机场税收",
                                    /// <summary>
                                    /// 经济舱全价
                                    /// </summary>
                                    YFare: "经济舱全价",
                                    /// <summary>
                                    /// 公务舱全价
                                    /// </summary>
                                    CFare: "公务舱全价",
                                    /// <summary>
                                    /// 头等舱全价
                                    /// </summary>
                                    FFare: "头等舱全价",
                                    /// <summary>
                                    /// 航班号
                                    /// </summary>
                                    Number: "航班号",
                                    /// <summary>
                                    ///航空公司
                                    /// </summary>
                                    Airline: "航空公司",
                                    /// <summary>
                                    /// 航空公司名称
                                    /// </summary>
                                    AirlineName: "航空公司名称",
                                    /// <summary>
                                    /// 机型
                                    /// </summary>
                                    PlaneType: "机型",
                                    /// <summary>
                                    /// 机型描述
                                    /// </summary>
                                    PlaneTypeDescribe: "机型描述",
                                    /// <summary>
                                    /// 代码共享实际承运航班号
                                    /// </summary>
                                    CodeShareNumber: "代码共享实际承运航班号",
                                    /// <summary>
                                    /// 承运
                                    /// </summary>
                                    Carrier: "承运",
                                    /// <summary>
                                    /// 承运名称
                                    /// </summary>
                                    CarrierName: "承运名称",
                                    /// <summary>
                                    /// 出发机场
                                    /// </summary>
                                    FromAirport: "出发机场",
                                    /// <summary>
                                    /// 到达机场
                                    /// </summary>
                                    ToAirport: "到达机场",
                                    /// <summary>
                                    /// 出发机场
                                    /// </summary>
                                    FromAirportName: "出发机场",
                                    /// <summary>
                                    /// 出发机场
                                    /// </summary>
                                    FromCityName: "出发机场",
                                    /// <summary>
                                    /// 到达机场
                                    /// </summary>
                                    ToAirportName: "到达机场",
                                    /// <summary>
                                    /// 到达机场
                                    /// </summary>
                                    ToCityName: "ToCityName",
                                    /// <summary>
                                    /// 起飞时间
                                    /// </summary>
                                    TakeoffTime: `${moment().format("YYYY-MM-DDTHH:mm:ss")}`,
                                    /// <summary>
                                    /// 到达时间
                                    /// </summary>
                                    ArrivalTime: `${moment().add(1.3, "hours").format("YYYY-MM-DDTHH:mm:ss")}`,
                                    /// <summary>
                                    /// 始发航站楼
                                    /// </summary>
                                    FromTerminal: "始发航站楼",
                                    /// <summary>
                                    /// 到达航站楼
                                    /// </summary>
                                    ToTerminal: "到达航站楼",
                                    /// <summary>
                                    /// 是否经停
                                    /// 经停 True
                                    /// 直飞 False
                                    /// </summary>
                                    IsStop: true,
                                    //Normal价
                                    BasicPrice: "Normal价",
                                    //前后航班最低价
                                    LowerPrice: "前后航班最低价",
                                    //前后最低价航班
                                    LowerFlightNumber: "前后最低价航班",
                                    //当前航班最低价
                                    CurrentLowestFare: "当前航班最低价",
                                    //退政策
                                    RefundRule: "退政策",
                                    //改政策
                                    ChangeRule: "改政策",
                                    //Ei政策
                                    EiRule: "Ei政策",
                                    /// <summary>
                                    /// 经停城市
                                    /// </summary>
                                    StopCities: [
                                        {
                                            /// <summary>
                                            /// 经停机场代码
                                            /// </summary>
                                            AirportCode: "经停机场代码",
                                            /// <summary>
                                            /// 经停机场名称
                                            /// </summary>
                                            AirportName: "经停机场名称",
                                            /// <summary>
                                            /// 经停城市名称
                                            /// </summary>
                                            CityName: "经停城市名称",
                                            /// <summary>
                                            /// 到达时间（先）
                                            /// </summary>
                                            ArriveTime: `${moment().add(0.5, "hours").format("YYYY-MM-DDTHH:mm:ss")}`,
                                            /// <summary>
                                            /// 起飞时间（后）
                                            /// </summary>
                                            TakeoffTime: `${moment().add(1, 'hours').format("YYYY-MM-DDTHH:mm:ss")}`,
                                            /// <summary>
                                            /// 获得经停时间
                                            /// 2h30m
                                            /// </summary>
                                            /// <returns></returns>
                                            StayTime: "2h35m"
                                        }
                                    ],
                                    /// <summary>
                                    /// 变量数据
                                    /// </summary>
                                    Variables: {},
                                    /// <summary>
                                    /// 飞行距离
                                    /// </summary>
                                    Distance: "2000",
                                    /// <summary>
                                    /// 获得飞行时间
                                    /// </summary>
                                    /// <returns></returns>
                                    FlyTime: "获得飞行时间",
                                    FlyTimeName: `3h20m`,
                                    /// <summary>
                                    /// 舱位
                                    /// </summary>
                                    Cabins: [],
                                },

                                InsuranceProducts: [
                                    {
                                        /// <summary>
                                        /// 设置
                                        /// </summary>
                                        Variables: "设置",
                                        /// <summary>
                                        /// Flight,Train,Alone
                                        /// </summary>
                                        Tag: "Flight",
                                        /// <summary>
                                        /// 
                                        /// </summary>
                                        BookType: InsuranceBookType.HangLian,

                                        InsuranceType: OrderInsuranceType.FlightDelay,

                                        SupplierType: InsuranceSupplierType.Platform,

                                        /// <summary>
                                        /// 动态字段字符串，使用"-"分隔
                                        /// </summary>
                                        BookCode: `动态字段字符串，使用"-"分隔`,
                                        /// <summary>
                                        /// 产品名称
                                        /// </summary>
                                        Name: "产品名称",
                                        /// <summary>
                                        /// 描述
                                        /// </summary>
                                        Detail: "描述",

                                        /// <summary>
                                        /// 保额
                                        /// </summary>
                                        InsuredAmount: "保额",
                                        /// <summary>
                                        /// 保险起期
                                        /// </summary>
                                        EffectiveDate: "保险起期",
                                        /// <summary>
                                        /// 保险止期
                                        /// </summary>
                                        ExpireDate: "保险止期",


                                        /// <summary>
                                        /// 单价
                                        /// </summary>
                                        Price: "单价",

                                        /// <summary>
                                        /// 成本
                                        /// </summary>
                                        Cost: "成本",
                                    }
                                ],
                                /// <summary>
                                ///  名称
                                /// </summary>
                                TypeName: "名称",

                                /// <summary>
                                /// 运价类型名称
                                /// </summary>
                                FareTypeName: "运价类型名称",
                                /// <summary>
                                /// 来源名称
                                /// </summary>
                                SupplierTypeName: "来源名称",

                                /// <summary>
                                /// 是否允许预订
                                /// </summary>
                                IsAllowOrder: true,
                                /// <summary>
                                /// 违规
                                /// </summary>
                                Rules: {}
                            }]
                        }
                    ]
                }
            ]
        }
    ]
}