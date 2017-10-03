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

	function login(user) {
		return $http.post('/auth', user ).then( function(res) {
			setLoginUser(res.data);
			if ( loginUser.latch === true ) {
				$window.location.href = loginUser.targetUri+"?qlikTicket="+loginUser.ticket;
			} else {
				$state.go('dashboard');
			}
		}, function(err) {
			console.log('err', err);
		});
	}

	return {
		setLoginUser: setLoginUser,
		getLoginUser: getLoginUser,
		login: login
	};

}]);

angular.module('sessApp').controller('LoginCtrl', ['$scope', 'AuthService',
	function($scope, AuthService) {
	$scope.doLogin = function(){
		$scope.loginProm = AuthService.login($scope.user);
	};
}]);
