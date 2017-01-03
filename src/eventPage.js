function getScoreImage(ratingKey = "fhrs_0_en-gb", type = "small") {
  return chrome.extension.getURL("images/scores/" + ratingKey + ".jpg");
}

function getBusinessPage(id) {
  return "http://ratings.food.gov.uk/business/en-GB/" + id;
}

function getScoreData(msg) {
  return getScoreDataFromPostcode(msg.postcode);
}

function getScoreDataFromPostcode(postcode) {
  return jQuery.ajax({
    url: "http://api.ratings.food.gov.uk/Establishments?address=" + encodeURIComponent(postcode),
    type: "GET",
    dataType: "json",
    headers: { "x-api-version": 2 }
  });
}

function getMatchingBusiness(msg, data) {
  var businesses = data.establishments.map(business => business.BusinessName);
  var names = FuzzySet(businesses, useLevenshtein = false);
  var similar = names.get(msg.name);
  if (similar && similar[0][0] >= 0.4) {
    return data.establishments.find(business => business.BusinessName == similar[0][1]);
  }
  return null;
}

function getBusinessInfo(msg, business) {
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
      getScoreData(msg)
        .then(data => getMatchingBusiness(msg, data))
        .then(business => getBusinessInfo(msg, business))
        .then(businessInfo => port.postMessage(businessInfo))
    }
  });
});
