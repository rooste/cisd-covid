const http = require('https')
const reader = require('./htmlhandler');
const db = require('./db').db;




function callback(response) {
    var content = ''

    response.on('data', function (chunk) {
      content += chunk;
    });
  
    response.on('end', function () {
      console.log('end');
      reader.onHtml(content);
    });

}

db.intialize().then(() => http.get("https://www.coppellisd.com/COVID-19Dashboard", callback).end())

