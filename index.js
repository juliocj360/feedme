const express = require('express');
const app = express();
const request = require('request');
const parseString = require('xml2js').parseString
const PORT = 3009;

app.listen(PORT, () => {
  console.log('listening on port ' + PORT)
});

app.use(express.static('public'));

app.get('/feed/:id', (req, res) => {
  request('https://queryfeed.net/twitter?q=' + req.params.id, function(err, response, body) {
      if (err) {
        console.log(err)
        return
      }
      parseString(body, function(err, result) {
        if (err) {
          console.log(err)
          return
        }
        res.json(result)
      })
    })
  })
