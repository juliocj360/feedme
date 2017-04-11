const express = require('express')
const app = express()
const request = require('request')
const parseString = require('xml2js').parseString
const PORT = 3009
const sse = require('connect-sse')()
let currentQuery = ''
let currentResults
let timer

app.use(express.static('public'))

app.get('/feed/:id', (req, res) => {
  currentQuery = req.params.id
  request('https://queryfeed.net/twitter?q=' + req.params.id, (err, response, body) => {
    if (err) {
      console.log(err)
      return
    }
    parseString(body, (err, result) => {
      if (err) {
        console.log(err)
        return
      }
      currentResults = result.rss.channel[0].item
      res.json(result)
    })
  })
})

app.get('/events', sse, function (req, res) {
  clearInterval(timer)
  let newResults
  timer = setInterval(() => {
    request('https://queryfeed.net/twitter?q=' + currentQuery, (err, response, body) => {
      if (err) {
        console.log(err)
        return
      }
      parseString(body, (err, result) => {
        if (err) {
          console.log(err)
          return
        }
        newResults = result.rss.channel[0].item
        console.log('new: ' + newResults[0].title[0])
        if (currentResults[0].title[0] !== newResults[0].title[0]) {
          res.json({ "newTweets": true })
        }
        else {
          res.json({ "newTweets": false })
        }
      })
    })
    console.log('old: ' + currentResults[0].title[0])
  }, 10000)
})

app.listen(PORT, () => {
  console.log('listening on port ' + PORT)
})
