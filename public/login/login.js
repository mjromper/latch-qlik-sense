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
				$window.location.href = "https://ukwin-aor-w10/latch/hub?qlikTicket="+loginUser.ticket;
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
	$scope.user = {
		dir: 'LATCH'
	};
	$scope.someUsers = ['20036919', '50013849', '50295945', '20128051', '20078041', '50310518', '50156338', '50025944'];

	$scope.doLogin = function(){
		$scope.loginProm = AuthService.login($scope.user);
	};
}]);
