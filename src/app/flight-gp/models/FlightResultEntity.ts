import { FlightSegmentEntity } from "./flight/FlightSegmentEntity";
import { FlightQueryEntity } from "./FlightQueryEntity";
import { FlightFareEntity } from "./FlightFareEntity";
import { FlightRouteEntity } from "./flight/FlightRouteEntity";
import { FlightPolicyEntity } from "./flight/FlightPolicyEntity";
import { FlightStopCityEntity } from "./flight/FlightStopCityEntity";

export class FlightResultEntity {
  /// <summary>
  /// 航班查询
  /// </summary>
  FlightQuery: FlightQueryEntity;
  /// <summary>
  /// 航班
  /// </summary>
  FlightSegments: FlightSegmentEntity[];
  /// <summary>
  ///
  /// </summary>
  FlightFares: FlightFareEntity[];
  /// <summary>
  ///
  /// </summary>
  FlightRoutes: FlightRouteEntity[];
  flightRoutesData: FlightRouteEntity[];
  FlightStopCities: FlightStopCityEntity[];
  /// <summary>
  /// 政策
  /// </summary>
  FlightPolicies: FlightPolicyEntity[];
}
