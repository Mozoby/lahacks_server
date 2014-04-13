'use strict';

angular.module('socialGameApp')
  .controller('MainCtrl', function ($scope, $goKey) {

    var url = 'https://goinstant.net/df6160309f0a/my-application';
//    // Connect to GoInstant
//    goinstant.connect(url, function(err, platformObj, roomObj) {
//      if (err) {
//        throw err;
//      }
//
//      // Create a new instance of the Chat widget
//      var chat = new goinstant.widgets.Chat({
//        room: roomObj
//      });
//
//      // Initialize the Chat widget
//      chat.initialize(function(err) {
//        if (err) {
//          throw err;
//        }
//        // Now it should render on the page
//      });
//    });



    var socket = io.connect('http://lahacks.cloudapp.net:8080');
    socket.on('connection', function (data) {
      console.log(data);

    });
    socket.emit('initialize', {id: "user1"} );
    socket.on('update', function (data) {
      console.log(data);
    });

    socket.on("disconnect", function() {
      console.log('disconnect');
      socket = io.connect('http://lahacks.cloudapp.net:8080');
    });

    socket.on("finalize", function(data) {
      console.log("final");
    });

    socket.on("questions", function(data) {
      console.log(data);
    });

  });
