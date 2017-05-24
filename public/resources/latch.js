angular.module('sessApp').factory('LatchResource', ['$resource', function($resource) {
    return $resource('/latchpair', {}, {
        pair: {
            method: 'POST'
        }
    });
}]);
