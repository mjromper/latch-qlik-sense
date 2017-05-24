angular.module('sessApp').controller('DashboardCtrl', ['$scope', '$state', 'AuthService', 'LatchResource',
	function($scope, $state, AuthService, LatchResource) {

	$scope.user = AuthService.getLoginUser();
	$scope.isUserLatchLocked = $scope.user.latch === false;
	$scope.latch = {};
	$scope.paired = false;

	$scope.pair = function() {
		var data = {"username": $scope.user.username, "code": $scope.latch.code};
		console.log("data", data);
		LatchResource.pair(data, function (res) {
          	console.log('success', res);
          	$scope.paired = true;
     	}, function(err) {
     		console.log("err pairing", err);
     	});
	};
}]);
