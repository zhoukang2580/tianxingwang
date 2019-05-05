import { FlightPolicyModel } from "./flight/FlightPolicyModel";
import { TrainPolicyModel } from "./train/TrainPolicyModel";
export class PassengerPolicyModel {
  PassengerKey: string; //  Yes 旅客 Id
  TrainPolicies: TrainPolicyModel[]; // List<TrainPolicy> No 火车票政策
  FlightPolicies: FlightPolicyModel[]; // List<FlightPolicy> No 机票政策
}
