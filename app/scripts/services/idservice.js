'use strict';

angular.module('socialGameApp')
  .factory('idservice', function () {

    var randomId = "Guest " + Math.floor( Math.random() * 8000 + 1000 );

    // Public API here
    return {
      id: randomId
    };
  });
