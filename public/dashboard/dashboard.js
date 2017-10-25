angular.module('sessApp').controller('DashboardCtrl', ['$scope', '$rootScope', '$state', 'AuthService', 'LatchResource', 'LatchUnpairResource',
	function($scope, $rootScope, $state, AuthService, LatchResource, LatchUnpairResource) {

	$scope.user = AuthService.getLoginUser();
	$scope.isUserLatchLocked = $scope.user.latch === false;
	$scope.latch = {};
	$scope.paired = false;

	$scope.pair = function() {
		var data = {"username": $scope.user.username, "code": $scope.latch.code};
		LatchResource.pair(data, function (res) {
          	console.log('success', res);
          	$scope.paired = true;
     	}, function(err) {
     		console.log("err pairing", err);
     	});
	};

	$scope.retry = function() {
		AuthService.retry($scope.user);
	};

	$scope.unpair = function() {
		LatchUnpairResource.unpair({user: $scope.user.username}, function (res) {
          	$rootScope.logout();
     	}, function(err) {
     		console.log("err unpairing", err);
     	});
	};
}]);
