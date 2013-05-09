(function() {
    'use strict';
    var app = angular.module('myApp', ['myServices', 'myDirectives']);

    app.controller('AppController', function($scope) {

    });

    app.controller('HomeController', function() {

    });

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/home', {templateUrl: 'partials/home.html'}).
            when('/container')
            otherwise({redirectTo: '/home'});
        }]);
})();