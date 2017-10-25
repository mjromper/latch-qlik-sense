'use strict';

angular.module('sessApp').factory('AuthService', [ '$rootScope', '$http', '$cookies', '$window', '$state', function($rootScope, $http, $cookies, $window, $state) {
	var loginUser;

	function setLoginUser(u) {
		loginUser = u;
		$cookies.putObject('sessionApp-user', u, { expires: 0, httpOnly: true, path: '/' });
		$rootScope.loginUser = u;
	}

	function getLoginUser() {
		var userCookies = $cookies.getObject('sessionApp-user');
		loginUser = userCookies;
		if ( userCookies && !$rootScope.loginUser ) {
			$rootScope.loginUser = loginUser;
		}
		return loginUser;
	}

	function _redirect(){
		if ( loginUser.latch === true ) {
			$window.location.href = loginUser.targetUri+"?qlikTicket="+loginUser.ticket;
		} else {
			$state.go('dashboard');
		}
	}

	function login(user, errFn) {
		return $http.post('/auth', user ).then( function(res) {
			setLoginUser(res.data);
			_redirect();
			return loginUser;
		}, function(err){
			errFn(err);
			console.log("err login", err);
		});
	}

	function retry(user) {
		return $http.post('/retry', user ).then( function(res) {
			setLoginUser(res.data);
			_redirect();
			return loginUser;
		}, function(err){
			console.log("err login", err);
		});
	}

	return {
		setLoginUser: setLoginUser,
		getLoginUser: getLoginUser,
		login: login,
		retry: retry
	};

}]);

angular.module('sessApp').controller('LoginCtrl', ['$scope', 'AuthService',
	function($scope, AuthService) {
		$scope.errorMessage = null;

	$scope.doLogin = function(){
		$scope.errorMessage = null;
		$scope.loginProm = AuthService.login($scope.user, function(err){
			$scope.errorMessage = err.data.error;
		});
	};
}]);
