var postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;

var port = chrome.runtime.connect({ name: "je" });

port.onMessage.addListener(msg => {
  var title = msg.name + " (" + msg.score + ")";
  var img = "<img src='" + msg.imageUrl + "' alt='" + title + "' title='" + title + "'>";
  var link = "<a href='" + msg.businessUrl + "' target='_blank'>" + img + "</a>"
  $("div#sotd_" + msg.jeId).html(link);
});

$("div[data-ft='searchResultOpenRestaurantCard']").each((index, elem) => {
  var jeId = $(elem).attr("data-restaurant-id");
  var name = $(elem).find("h2[data-ft='restaurantDetailsName']").text().trim();
  var postcode = ($(elem).find("p[data-ft='restaurantDetailsAddress']").text().trim().match(postcodeRegex) || [''])[0];
  $("<div id='sotd_" + jeId + "' class='sotd'><div class='loader'/></div>").prependTo($(elem).find("div.o-tile__aside"));
  port.postMessage({ jeId: jeId, name: name, postcode: postcode });
});
