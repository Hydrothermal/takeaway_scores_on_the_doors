function getScoreImage(ratingKey = "fhrs_0_en-gb", type = "small") {
  return "http://ratings.food.gov.uk/images/scores/" + type + "/" + ratingKey + ".JPG";
}

function getBusinessPage(id) {
  return "http://ratings.food.gov.uk/business/en-GB/" + id;
}

function getScoreData(name, postcode, callback) {
  $.ajax({
    url: "http://api.ratings.food.gov.uk/Establishments?address=" + encodeURIComponent(postcode),
    type: "GET",
    dataType: "json",
    headers: { "x-api-version": 2 }
  }).success(callback);
}

function parseBusinessInfo(name, postcode, data) {
  var msg = {
    name: name,
    score: "AwaitingInspection",
    imageUrl: getScoreImage("fhrs_awaitinginspection_en-gb"),
    businessUrl: "http://ratings.food.gov.uk/enhanced-search/en-GB/%5E/" + postcode + "/Relevance/0/%5E/%5E/1/1/10"
  };
  if (data.establishments.length == 1) {
    var business = data.establishments[0];
    msg.name = business.BusinessName;
    msg.score = business.RatingValue;
    msg.imageUrl = getScoreImage(business.RatingKey);
    msg.businessUrl = getBusinessPage(business.FHRSID);
  } else {
    var names = FuzzySet();
    for (var i = 0; i < data.establishments.length; i++) {
      var business = data.establishments[i];
      names.add(business.BusinessName);
    }
    var similar = names.get(name);
    if (similar) {
      var matchedName = similar[0][1]
      for (var i = 0; i < data.establishments.length; i++) {
        var business = data.establishments[i];
        if (business.BusinessName == matchedName) {
          msg.name = business.BusinessName;
          msg.score = business.RatingValue;
          msg.imageUrl = getScoreImage(business.RatingKey);
          msg.businessUrl = getBusinessPage(business.FHRSID);
          break;
        }
      }
    }
  }
  return msg;
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
