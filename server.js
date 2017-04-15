var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

// viewed at http://localhost:8080
app.use(express.static(__dirname + '/public'));

// app.get('/', function(req, res) {
//   res.sendfile('./public/index.html');
// });

app.listen(port);
console.log('Server launched on port:', port);
