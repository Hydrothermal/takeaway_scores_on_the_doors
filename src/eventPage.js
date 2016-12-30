function getScoreImage(ratingKey = "fhrs_0_en-gb", type = "small") {
  return chrome.extension.getURL("images/scores/" + ratingKey + ".jpg");
}

function getBusinessPage(id) {
  return "http://ratings.food.gov.uk/business/en-GB/" + id;
}

function getScoreData(name, postcode, callback) {
  jQuery.ajax({
    url: "http://api.ratings.food.gov.uk/Establishments?address=" + encodeURIComponent(postcode),
    type: "GET",
    dataType: "json",
    headers: { "x-api-version": 2 }
  }).done(callback);
}

function generateBusinessInfo(name, postcode, business) {
  var businessInfo = {
    name: name,
    score: "AwaitingInspection",
    imageUrl: getScoreImage("fhrs_awaitinginspection_en-gb"),
    businessUrl: "http://ratings.food.gov.uk/enhanced-search/en-GB/%5E/" + postcode + "/Relevance/0/%5E/%5E/1/1/10"
  };
  if (business) {
    businessInfo.name = business.BusinessName;
    businessInfo.score = business.RatingValue;
    businessInfo.imageUrl = getScoreImage(business.RatingKey);
    businessInfo.businessUrl = getBusinessPage(business.FHRSID);
  }
  return businessInfo;
}

function parseBusinessInfo(name, postcode, data) {
  var names = FuzzySet();
  data.establishments.forEach(function(business) {
    names.add(business.BusinessName);
  });
  var similar = names.get(name);
  if (similar) {
    var business = data.establishments.find(function(business) {
      return business.BusinessName == similar[0][1];
    });
    return generateBusinessInfo(name, postcode, business);
  }
  return generateBusinessInfo(name, postcode, undefined);
}

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    if (msg.jeId && msg.name && msg.postcode) {
      getScoreData(msg.name, msg.postcode, function(data) {
        var businessInfo = parseBusinessInfo(msg.name, msg.postcode, data);
        businessInfo.jeId = msg.jeId;
        port.postMessage(businessInfo);
      });
    }
  });
});
