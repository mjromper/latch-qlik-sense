'use strict';

angular.module('sessApp', ['ui.router', 'ngCookies', 'cgBusy', 'ngResource'])
.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider.state( {
        name: 'login',
        url: '/login',
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl'
    });

    $stateProvider.state( {
        name: 'dashboard',
        url: '/dashboard',
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        authenticate: true
    });

}])
.run(['$rootScope', '$state', 'AuthService', '$window', function ($rootScope, $state, AuthService, $window) {

    $rootScope.$on('$stateChangeStart', function ( event, next, nextparams ) {
        if ( next.authenticate ){
            if ( !AuthService.getLoginUser() ) {
                $state.go('login', nextparams);
                event.preventDefault();
            }
        } else {
            //AuthService.setLoginUser(null);
        }
    });

    $rootScope.logout = function() {
        var user = AuthService.getLoginUser();
        AuthService.setLoginUser(null);
        $window.location.href = user.targetUri;
    };

}]);

