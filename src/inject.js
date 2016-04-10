var postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;

var port = chrome.runtime.connect({ name: "je" });

port.onMessage.addListener(function(msg) {
  var title = msg.name + " (" + msg.score + "/5)";
  var img = "<img src='" + msg.imageUrl + "' alt='" + title + "' title='" + title + "'>";
  var link = "<a href='" + msg.businessUrl + "' target='_blank'>" + img + "</a>"
  $(link).insertAfter($(".restaurant[data-restaurant-id='" + msg.jeId + "'] .viewMenu"));
});

$(".restaurants .restaurant").each(function(index, element) {
  var jeId = $(this).attr("data-restaurant-id");
  var name = $(this).find("h2.name").text().trim();
  var postcode = $(this).find(".address").text().trim().match(postcodeRegex);
  console.log("sending a message for " + name + " " + postcode);
  port.postMessage({ jeId: jeId, name: name, postcode: postcode });
});
