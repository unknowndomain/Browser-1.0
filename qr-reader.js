var imagesnap = require('imagesnap');
var fs = require('fs');
var imageStream = fs.createWriteStream('capture.jpg');
imagesnap().pipe(imageStream);