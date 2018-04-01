const port = chrome.runtime.connect({ name: "takeaway" });
const postCodeRegex = /([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})/gi;

function formatPostcode(postCode) {
  var match = postCode.trim().match(postCodeRegex);
  if (match) return match[0].replace(postCodeRegex, "$1 $2");
  return '';
}

function randomString(len) {
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
}

port.onMessage.addListener(msg => {
  var title = msg.name + " (" + msg.score + ")";
  var img = "<img src='" + msg.imageUrl + "' alt='" + title + "' title='" + title + "'>";
  var link = "<a href='" + msg.businessUrl + "' target='_blank'>" + img + "</a>"
  $("div#sotd_" + msg.rId).html(link);
});

// JUST EAT - Search results
$("div[data-ft='searchResultOpenRestaurantCard']").each((index, elem) => {
  var rId = $(elem).attr("data-restaurant-id");
  var name = $(elem).find("h2[itemprop='name']").text().trim();
  var postcode = formatPostcode($(elem).find("p[itemprop='address']").text());
  $("<div id='sotd_" + rId + "' class='sotd'><div class='loader'/></div>").prependTo($(elem).find("div.o-tile__aside"));
  port.postMessage({ rId: rId, name: name, postcode: postcode });
});

// JUST EAT - Restaurant
$("div.restaurantOverview").each((index, elem) => {
  var rId = $(elem).attr("data-restaurant-id");
  var name = $(elem).find("h1[itemprop='name']").text().trim();
  var postcode = formatPostcode($(elem).find("p[itemprop='address']").text());
  $("<div id='sotd_" + rId + "' class='sotd'><div class='loader'/></div>").appendTo($(elem).find("div.details"));
  port.postMessage({ rId: rId, name: name, postcode: postcode });
});

// Deliveroo - Restaurant
$("div.restaurant--main div.restaurant__details").each((index, elem) => {
  var rId = randomString(12);
  var name = $(elem).find("h1.restaurant__name").text().trim();
  var postcode = formatPostcode($(elem).find("small.address").text());
  $("<div id='sotd_" + rId + "' class='sotd'><div class='loader'/></div>").appendTo(elem);
  port.postMessage({ rId: rId, name: name, postcode: postcode });
});
