'use strict';

angular.module('socialGameApp', [
  'ngRoute', 'goangular'
])
  .config(function ($routeProvider, $goConnectionProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/chat/:uuid', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })
      .when('/end', {
        templateUrl: 'views/end.html',
        controller: 'EndCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $goConnectionProvider.$set('https://goinstant.net/df6160309f0a/my-application');
  });
