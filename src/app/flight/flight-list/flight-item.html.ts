export const FLIGHT_ITEM_TEMPLATE = `<div class='left'>
<h4 class="time">
    <strong>@Name=TakeoffShortTime@Value</strong>
    <span class="line">-----&nbsp;
        @Name=IsStop@Value ? "经停" : "直飞"&nbsp;-----</span>
    <strong>@Name=ArrivalShortTime@Value
        @Name=AddOneDayTip@Value ? "<span class='addoneday'>@Name=AddOneDayTip@Value</span>" : ""
    </strong>
</h4>
<div class="airports">
    <span>@Name=FromAirportName@Name=FromTerminal ? "(@Name=FromTerminal@Value)" : ""
    </span>
    <span>@Name=ToAirportName@Value@Name=ToTerminal@Value ? "(@Name=ToTerminal@Value)" : ""
    </span>
</div>
<div class="desc">
    <img src="@Name=AirlineSrc" class="airlinesrc">
    <label>@Name=AirlineName@Value</label>
    <label>|@Name=Number@Value</label>
    <label>|@Name=PlaneType@Value</label>
    @Name=CodeShareNumber@Value
    ? "|<span class='code-share-number'>共享@Name=CodeShareNumber@Value
    </span>"
    : ""

</div>
</div>
<div class="price">
￥@Name=LowestFare@Value
</div>`;
