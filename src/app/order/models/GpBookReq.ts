import { FlightSegmentEntity } from "src/app/flight-gp/models/flight/FlightSegmentEntity";
import { FlightFareEntity } from "src/app/flight-gp/models/FlightFareEntity";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { OrderLinkmanDto } from "./OrderLinkmanDto";
import { OrderTravelPayType } from "./OrderTravelEntity";

export class GpBookReq {
    Linkman: OrderLinkmanDto;

    PassengerDtos: GpPassengerDto[];

    FlightCabin: FlightFareEntity;

    FlightSegment: FlightSegmentEntity;

    Insurance: InsuranceProductEntity;

    PayType: OrderTravelPayType;

    IsAllowIssueTicket: boolean;
}

export class GpPassengerDto {
    /// <summary>
    /// 旅客ID
    /// </summary>
    Pid: string;
    /// <summary>
    /// 证件姓名
    /// </summary>
    Name: string;
    /// <summary>
    /// 证件类型
    /// </summary>
    Type: CredentialsType
    /// <summary>
    /// 证件号
    /// </summary>
    Number: string;
    /// <summary>
    /// 旅客手机号
    /// </summary>
    Mobile: string;
    /// <summary>
    /// GP公务验真标识；1：公务卡，2：预算单位
    /// </summary>
    GPValidateStatus: number;
    /// <summary>
    /// GP验真单位
    /// </summary>
    GPOrganization: string;
    /// <summary>
    /// GP公务卡BIN
    /// </summary>
    GPCardBin: string;
    /// <summary>
    /// GP公务卡卡名
    /// </summary>
    GPCardName: string;
}