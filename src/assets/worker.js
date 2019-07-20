self.addEventListener(
  "message",
  function(evt) {
    // console.log(evt);
    if (evt.data) {
      switch (evt.data.message) {
        case "sortByPrice": {
          self.postMessage({
            message: "sortByPrice",
            segments: sortByPrice(evt.data.segments, evt.data.l2h)
          });
          break;
        }
        case "sortByTime": {
          self.postMessage({
            message: "sortByTime",
            segments: sortByTime(evt.data.segments, evt.data.l2h)
          });
          break;
        }
        case "getHtmlTemplate": {
          self.postMessage({
            message: "getHtmlTemplate",
            data: getHtmlTemplate(evt.data.array)
          });
          break;
        }
        case "fetch": {
          fetchData(evt.data.url, evt.data.body);

          break;
        }
      }
    }
  },
  false
);
function generateFlightItem(s) {
  return `<div class='left'>
  <h4 class="time">
<strong>${s.TakeoffShortTime}</strong>
      <span class="line">-----&nbsp;${
        s.IsStop ? `经停` : `直飞`
      }&nbsp;-----</span>
      <strong>${s.ArrivalShortTime}
        ${
          s.AddOneDayTip
            ? `<span class='addoneday'>${s.AddOneDayTip}</span>`
            : ``
        }
      </strong>
  </h4>
  <div class="airports">
      <span>${s.FromAirportName}${
    s.FromTerminal ? `(${s.FromTerminal})` : ``
  }</span>
      <span>${s.ToAirportName}${s.ToTerminal ? `(${s.ToTerminal})` : ``}</span>
  </div>
  <div class="desc">
      <img src="${s.AirlineSrc}" class="airlinesrc">
      <label>${s.AirlineName}</label>
      <label>|${s.Number}</label>
      <label>|${s.PlaneType}</label>
      ${
        s.CodeShareNumber
          ? `|<span class='code-share-number'>共享${s.CodeShareNumber}</span>`
          : ``
      }
  </div>
</div>
<div class="price">
  ￥${s.LowestFare}
</div>`;
}
function replaceStr(template, item) {
  const arr = template.match(/@\S+@/gi);
  const keys = (arr || []).map(itm =>
    itm.replace(/@Name=/g, "").replace(/@/g, "")
  );
  if (keys.length === 0) {
    return template;
  }
  keys.map(k => {
    const p = new RegExp(k, "g");
    template.replace(p, item[k]);
  });
}
function getHtmlTemplate(array) {
  console.time("getHtmlTemplate");
  const htmlTemplate = array.map(s => {
    return { item: s, templateHtmlString: generateFlightItem(s) };
  });
  console.timeEnd("getHtmlTemplate");
  return htmlTemplate;
}
function sortByPrice(segments, l2h) {
  this.console.time("sortByPrice");
  var segments = segments.sort((s1, s2) => {
    let sub = +s1.LowestFare - +s2.LowestFare;
    sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
    return l2h ? sub : -sub;
  });
  this.console.timeEnd("sortByPrice");
  return segments;
}
function sortByTime(segments, l2h) {
  this.console.time("sortByTime");
  var segments = segments.sort((s1, s2) => {
    let sub = +s1.TakeoffTimeStamp - +s2.TakeoffTimeStamp;
    sub = sub === 0 ? 0 : sub > 0 ? 1 : -1;
    return l2h ? sub : -sub;
  });
  this.console.timeEnd("sortByTime");
  return segments;
}
function fetchData(url, body) {
  // console.log(url, body);
  return self
    .fetch(url, { method: "post", body: body })
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(result => {
      self.postMessage({
        message: "fetchresponse",
        data: {
          status: true,
          result
        }
      });
    })
    .catch(err => {
      console.error("fetch error ", err);
      self.postMessage({
        message: "fetchresponse",
        data: {
          error: "服务器请求错误",
          status: false
        }
      });
    });
}
