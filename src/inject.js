var postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;

var port = chrome.runtime.connect({ name: "je" });

port.onMessage.addListener(function(msg) {
  var title = msg.name + " (" + msg.score + "/5)";
  var img = "<img src='" + msg.imageUrl + "' alt='" + title + "' title='" + title + "'>";
  var link = "<a href='" + msg.businessUrl + "' target='_blank'>" + img + "</a>"
  $("div#sotd_" + msg.jeId).html(link);
});

$("div[data-ft='searchResultOpenRestaurantCard']").each(function(index, element) {
  var jeId = $(this).attr("data-restaurant-id");
  var name = $(this).find("h2[data-ft='restaurantDetailsName']").text().trim();
  var postcode = ($(this).find("p[data-ft='restaurantDetailsAddress']").text().trim().match(postcodeRegex) || [''])[0];
  $("<div id='sotd_" + jeId + "' class='sotd'><div class='loader'/></div>").prependTo($(this).find("div.o-tile__aside"));
  port.postMessage({ jeId: jeId, name: name, postcode: postcode });
});
