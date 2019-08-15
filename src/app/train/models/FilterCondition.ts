export class FilterTrainCondition {
  trainType: "G" | "D" | "Z" | "T";
  departureTerminals: {}[];
  arrivalTerminals: {}[];
  departureTimeSpan: {
    lower: number;
    upper: number;
  };
  priceFromL2H?: "low2Height" | "height2Low" | "initial";
  timeFromM2N?: "am2pm" | "pm2am" | "initial";
  static init() {
    const condition = new FilterTrainCondition();
    condition.departureTimeSpan = {
      lower: 0,
      upper: 24
    };
    condition.priceFromL2H = "initial";
    condition.timeFromM2N = "initial";
    return condition;
  }
}
