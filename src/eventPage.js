function getScoreImage(ratingKey = "fhrs_0_en-gb", type = "small") {
  return chrome.extension.getURL("images/scores/" + ratingKey + ".jpg");
}

function getBusinessPage(id) {
  return "http://ratings.food.gov.uk/business/en-GB/" + id;
}

function getLatLngFromPostcode(postcode) {
  return jQuery.ajax({
    url: "https://api.postcodes.io/postcodes/" + encodeURIComponent(postcode),
    type: "GET",
    dataType: "json"
  }).promise();
}

function getScoreDataFromPostcode(postcode) {
  return jQuery.ajax({
    url: "http://api.ratings.food.gov.uk/Establishments?address=" + encodeURIComponent(postcode),
    type: "GET",
    dataType: "json",
    headers: { "x-api-version": 2 }
  }).promise();
}

function getScoreDataFromLatLng(lat, lng) {
  return jQuery.ajax({
    url: "http://api.ratings.food.gov.uk/Establishments?maxDistanceLimit=1&pageSize=1000&sortOptionKey=Distance&latitude=" + lat + "&longitude=" + lng,
    type: "GET",
    dataType: "json",
    headers: { "x-api-version": 2 }
  }).promise();
}

function getMatchingBusiness(msg, data, similarity = 0.4) {
  return new Promise((resolve, reject) => {
    var businesses = data.establishments.map(business => business.BusinessName);
    var names = FuzzySet(businesses, useLevenshtein = false);
    var similar = names.get(msg.name);
    if (similar && similar[0][0] >= similarity) {
      return resolve(data.establishments.find(business => business.BusinessName == similar[0][1]));
    }
    return resolve(undefined);
  });
}

function getBusinessFromPostcode(msg) {
  return getScoreDataFromPostcode(msg.postcode)
    .then(data => getMatchingBusiness(msg, data));
}

function getBusinessFromLatLng(msg) {
  return getLatLngFromPostcode(msg.postcode)
    .then(data => getScoreDataFromLatLng(data.result.latitude, data.result.longitude))
    .then(data => getMatchingBusiness(msg, data, similarity = 0.5));
}

function getBusiness(msg) {
  return getBusinessFromPostcode(msg)
    .then(business => {
      return business || getBusinessFromLatLng(msg);
    });
}

function extractBusinessInfo(msg, business) {
  var businessInfo = {
    jeId: msg.jeId,
    name: msg.name,
    score: "AwaitingInspection",
    imageUrl: getScoreImage("fhrs_awaitinginspection_en-gb"),
    businessUrl: "http://ratings.food.gov.uk/enhanced-search/en-GB/%5E/" + msg.postcode + "/Relevance/0/%5E/%5E/1/1/10"
  };
  if (business) {
    businessInfo.name = business.BusinessName;
    businessInfo.score = business.RatingValue;
    businessInfo.imageUrl = getScoreImage(business.RatingKey);
    businessInfo.businessUrl = getBusinessPage(business.FHRSID);
  }
  return businessInfo;
}

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(msg => {
    if (msg.jeId && msg.name && msg.postcode) {
      getBusiness(msg)
        .then(business => extractBusinessInfo(msg, business))
        .then(businessInfo => port.postMessage(businessInfo))
    }
  });
});
