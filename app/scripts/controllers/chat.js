'use strict';

angular.module('socialGameApp')
  .controller('ChatCtrl', function ($scope, $routeParams, $goKey, idservice) {

    var uuid = $routeParams.uuid;
    console.log(uuid);
//    uuid = "messages"; //todo: remove this

    $scope.messages = $goKey(uuid).$sync();
    window.scope = $scope;
    $scope.author = idservice.id;

    $scope.messages.$on('add', {
      local: true,
      listener: scrollOn
    });

    $scope.messages.$on('ready', scrollOn);

    $scope.sendMessage = function() {
      if(!$scope.newMessage) {
        return;
      }

      $scope.messages.$add({
        content: $scope.newMessage,
        author: $scope.author
      }).then(function() {
          $scope.$apply(function() {
            $scope.newMessage = '';
          });
        });
    };

    function scrollOn() {
      setTimeout(function() {
//        $('.gi-chat-wrapper').scrollTop($('.gi-chat-wrapper').children().height());
        window.scrollTo(0,document.body.scrollHeight);
      }, 0);
    }

    $scope.limitLength = function(st) {
      st = st || "no name";
      var maxLength = 20;
      return st.substr(0, maxLength);
    };

  });
