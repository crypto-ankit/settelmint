var express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var routes = require('./routes/router');
var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({    // to support URL-encoded bodies
  extended: true
}));
app.use(cors());
app.use('/', routes)

/// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//       message: err.message,
//       error: {},
//       title: 'error'
//   });
// });

app.set('port', 8082);
var server = app.listen(app.get('port'), function() {

console.log('Express server listening on port ' + server.address().port);

});
