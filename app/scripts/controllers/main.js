'use strict';

angular.module('socialGameApp')
  .controller('MainCtrl', function ($scope, $goKey, idservice) {

    window.scope = $scope;
    $scope.data = {};
    $scope.answers = [];
    $scope.clusterCount = 0;
    $scope.status = "waiting";

//    var url = 'https://goinstant.net/df6160309f0a/my-application';
    var id = idservice.id;
    console.log(id);
    enableGame( {question: "Best Music?", answers:['Katy Perry','Eminem','Linkin Park','Blake Shelton']} );

    var socket = {};
    try {
      socket = io.connect('http://lahacks.cloudapp.net:8080');
    } catch (e) {
      console.log(e);
    }

    socket.emit('initialize', {id: id} );

    socket.on('update', function (data) {
      console.log(data);
      var clusterCount = data.clusterCount || 0;
      $scope.clusterCount = clusterCount;
    });

    socket.on("finalize", function(data) {
      var id = data.roomId || Math.floor( Math.random() * 1000 );
      meet(id);
    });

    socket.on("question", function(data) {
      console.log(data);
      if (data) {
        enableGame(data);
      }
    });

    function answer (value) {
      console.log(value);
      socket.emit('answer', {answer: value});
      disableGame();
    }
    $scope.answer = answer;


    function enableGame(data) {
      $scope.status = "start";
      $scope.question = data.question;
      $scope.answers = data.answers;

      var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
          var matches, substrRegex;

          // an array that will be populated with substring matches
          matches = [];

          // regex used to determine if a string contains the substring `q`
          substrRegex = new RegExp(q, 'i');

          // iterate through the pool of strings and for any string that
          // contains the substring `q`, add it to the `matches` array
          $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
              // the typeahead jQuery plugin expects suggestions to a
              // JavaScript object, refer to typeahead docs for more info
              matches.push({ value: str });
            }
          });

          cb(matches);
        };
      };

      var suggestion = data.suggestion || [];
        $('#additionalAnswer .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
          },
          {
          name: 'keywords',
          displayKey: 'value',
            source: substringMatcher(suggestion)
          });

      $scope.disableAnswer = false;
      var startTime = new Date().getTime();
      var votingTime = 10;
      $scope.countDown = votingTime;
      var intervalId = setInterval(function() {
        $scope.$apply(function() {
          $scope.countDown -= 1;
          var time = new Date().getTime();
          if ( (time - startTime) > (votingTime * 1000) ) {
            $scope.disableAnswer = true;
            clearInterval(intervalId);
          }
        });
      }, 1000);
    }

    function disableGame() {
      $scope.disableAnswer = true;
    }

    function meet (id) {
      location.href = "#/chat/" + id;
    }

    function gameOver() {
      $("#startOver").modal("show");
    }

  });
