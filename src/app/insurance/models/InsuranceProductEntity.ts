import { InsuranceSupplierType } from './InsuranceSupplierType';
import { InsuranceBookType } from './InsuranceBookType';
import { OrderInsuranceType } from './OrderInsuranceType';

export class InsuranceProductEntity {
    /// <summary>
    /// 设置
    /// </summary>
    Variables: string;
    /// <summary>
    /// Flight,Train,Alone
    /// </summary>
    Tag: string;
    /// <summary>
    /// 
    /// </summary>
     BookType: InsuranceBookType;

     InsuranceType: OrderInsuranceType;

     SupplierType: InsuranceSupplierType;

    /// <summary>
    /// 动态字段字符串，使用"-"分隔
    /// </summary>
    BookCode: string;
    /// <summary>
    /// 产品名称
    /// </summary>
    Name: string;
    /// <summary>
    /// 描述
    /// </summary>
    Detail: string;

    /// <summary>
    /// 保额
    /// </summary>
    InsuredAmount: string;
    /// <summary>
    /// 保险起期
    /// </summary>
    EffectiveDate: string;
    /// <summary>
    /// 保险止期
    /// </summary>
    ExpireDate: string;


    /// <summary>
    /// 单价
    /// </summary>
    Price: string;

    /// <summary>
    /// 成本
    /// </summary>
    Cost: string;
}