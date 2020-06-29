/// Loads Texture From File On Network

var loadTextResource = function (url, callback) {
  var request = new XMLHttpRequest();
  // url + "?dont-cache=" + Math.random()
  // prevents caching
  request.open("GET", url + "?dont-cache=" + Math.random(), true);
  request.onload = function () {
    if (request.status < 200 || request.status > 299) {
      callback("ERROR::HTTP::" + request.status + " on resource " + url);
    } else {
      callback(null, request.responseText);
    }
  };
  request.send();
};

var loadImage = function (url, callback) {
  var image = new Image();
  image.onload = function () {
    callback(null, image);
  };
  image.src = url;
};

var loadJSON = function (url, callback) {
  loadTextResource(url, function (err, result) {
    if (err) {
      callback(err);
    } else {
      try {
        callback(null, JSON.parse(result));
      } catch (e) {
        callback(e);
      }
    }
  });
};
