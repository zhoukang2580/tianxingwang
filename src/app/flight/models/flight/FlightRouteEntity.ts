import { FlightSegmentEntity } from "./FlightSegmentEntity";
import { FlightFareEntity } from "../FlightFareEntity";
import { FlightCabinEntity } from "./FlightCabinEntity";

export class FlightRouteEntity {
  Airline: string; //  MU";
  ArrivalTime: string; // 2020-07-08T15:50:00";
  CFare: string; //  0;
  Cabin: string; //  Y";
  Destination: string; // BJS";
  Duration: string; //  275;
  FFare: string; //  0;
  FirstTime: string; // 2020-07-08T11:15:00";
  FlightRouteIds: string[];
  FlightSegmentIds: string[];
  flightFares: FlightFareEntity[];
  minPriceFlightFare: FlightFareEntity;
  selectFlightFare: FlightFareEntity;
  fromSegment: FlightSegmentEntity;
  toSegment: FlightSegmentEntity;
  isTransfer: boolean;
  transferSegments: FlightSegmentEntity[];
  FlightSegments: FlightSegmentEntity[];
  FromCountry: string; // CN";
  Id: string; //  1;
  IsAllowOrder: boolean;
  policy: {
    IsAllowOrder: boolean;
    IsIllegal: boolean;
    Message: string;
    FlightFare?: FlightFareEntity;
  };
  Key: string; // C4A3CF5E5BC5E7EAB8A1259DA38A943F";
  MaxDuration: string; //  100;
  Origin: string; // SHA";
  Paragraphs: number;
  Rules: any;
  ToCountry: string; // CN";
  Type: number;
  TypeName: string; // 经济舱";
  Week: string; // 周三";
  YFare: number;
  addDays?: number;
  flyTime?: string;
}
