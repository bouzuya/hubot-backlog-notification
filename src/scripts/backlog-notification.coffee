# Description
#   A Hubot script that returns your backlog notifications
#
# Configuration:
#   HUBOT_BACKLOG_NOTIFICATION_SPACE_ID
#   HUBOT_BACKLOG_NOTIFICATION_API_KEY
#   HUBOT_BACKLOG_NOTIFICATION_ROOM_ID
#   HUBOT_BACKLOG_NOTIFICATION_INTERVAL
#
# Commands:
#   None
#
# Author:
#   bouzuya <m@bouzuya.net>
#
module.exports = (robot) ->
  {Promise} = require 'es6-promise'
  request = require 'request-b'

  SPACE_ID = process.env.HUBOT_BACKLOG_NOTIFICATION_SPACE_ID
  API_KEY = process.env.HUBOT_BACKLOG_NOTIFICATION_API_KEY
  ROOM = process.env.HUBOT_BACKLOG_NOTIFICATION_ROOM_ID
  INTERVAL = process.env.HUBOT_BACKLOG_NOTIFICATION_INTERVAL ? '30000'
  BASE_URL = "https://#{SPACE_ID}.backlog.jp"

  latestId = null

  watch = (robot) ->

    next = ->
      setTimeout ->
        watch robot
      , parseInt(INTERVAL, 10)

    Promise.resolve()
    .then ->
      qs =
        apiKey: API_KEY
      qs.minId = minId if minId?

      request
        method: 'GET'
        url: "#{BASE_URL}/api/v2/notifications"
        qs: qs
    .then (res) ->
      notifications = JSON.parse res.body
      message = notifications
        .filter (n) ->
          n.id > latestId
        .filter (n) ->
          n.issue
        .map (n) ->
          [
            n.issue.issueKey
            n.issue.summary
            "#{BASE_URL}/view/#{n.issue.issueKey}"
          ].join ' '
        .join '\n'
      res.send message if latestId
      latestId = notifications[0].id
    .then next, next

  watch robot
