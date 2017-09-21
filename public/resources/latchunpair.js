angular.module('sessApp').factory('LatchUnpairResource', ['$resource', function($resource) {
    return $resource('/unpair/:user', {}, {
        unpair: {
            method: 'GET'
        }
    });
}]);
