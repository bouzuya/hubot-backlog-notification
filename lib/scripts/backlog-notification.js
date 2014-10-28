// Description
//   A Hubot script that returns your backlog notifications
//
// Configuration:
//   HUBOT_BACKLOG_NOTIFICATION_SPACE_ID
//   HUBOT_BACKLOG_NOTIFICATION_API_KEY
//   HUBOT_BACKLOG_NOTIFICATION_ROOM_ID
//   HUBOT_BACKLOG_NOTIFICATION_INTERVAL
//
// Commands:
//   None
//
// Author:
//   bouzuya <m@bouzuya.net>
//
module.exports = function(robot) {
  var API_KEY, BASE_URL, INTERVAL, Promise, ROOM, SPACE_ID, latestId, request, watch, _ref;
  Promise = require('es6-promise').Promise;
  request = require('request-b');
  SPACE_ID = process.env.HUBOT_BACKLOG_NOTIFICATION_SPACE_ID;
  API_KEY = process.env.HUBOT_BACKLOG_NOTIFICATION_API_KEY;
  ROOM = process.env.HUBOT_BACKLOG_NOTIFICATION_ROOM_ID;
  INTERVAL = (_ref = process.env.HUBOT_BACKLOG_NOTIFICATION_INTERVAL) != null ? _ref : '30000';
  BASE_URL = "https://" + SPACE_ID + ".backlog.jp";
  latestId = null;
  watch = function(robot) {
    var next;
    next = function() {
      return setTimeout(function() {
        return watch(robot);
      }, parseInt(INTERVAL, 10));
    };
    return Promise.resolve().then(function() {
      var qs;
      qs = {
        apiKey: API_KEY
      };
      if (typeof minId !== "undefined" && minId !== null) {
        qs.minId = minId;
      }
      return request({
        method: 'GET',
        url: "" + BASE_URL + "/api/v2/notifications",
        qs: qs
      });
    }).then(function(res) {
      var message, notifications;
      notifications = JSON.parse(res.body);
      message = notifications.filter(function(n) {
        return n.id > latestId;
      }).filter(function(n) {
        return n.issue;
      }).map(function(n) {
        return [n.issue.issueKey, n.issue.summary, "" + BASE_URL + "/view/" + n.issue.issueKey].join(' ');
      }).join('\n');
      if (latestId) {
        res.send(message);
      }
      return latestId = notifications[0].id;
    }).then(next, next);
  };
  return watch(robot);
};
