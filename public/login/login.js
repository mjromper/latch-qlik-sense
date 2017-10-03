'use strict';

angular.module('sessApp').factory('AuthService', [ '$rootScope', '$http', '$cookies', function($rootScope, $http, $cookies) {
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

	function login(user) {
		return $http.post('/auth', user ).then( function(res) {
			setLoginUser(res.data);
			return loginUser.latch;
		});
	}

	return {
		setLoginUser: setLoginUser,
		getLoginUser: getLoginUser,
		login: login
	};

}]);

angular.module('sessApp').controller('LoginCtrl', ['$scope', 'AuthService', '$window', '$state',
	function($scope, AuthService, $window, $state) {
		$scope.errorMessage = null;

	$scope.doLogin = function(){
		$scope.errorMessage = null;
		$scope.loginProm = AuthService.login($scope.user).then(function(loginUserLatch){
			if ( loginUserLatch === true ) {
				$window.location.href = loginUser.targetUri+"?qlikTicket="+loginUser.ticket;
			} else {
				$state.go('dashboard');
			}
		}, function(err){
			$scope.errorMessage = err.data.error;
		});
	};
}]);
