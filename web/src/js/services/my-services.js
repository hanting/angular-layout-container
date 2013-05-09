'use strict';

/* Services */

angular.module('myServices', ['ngResource']).
    factory('TeacherScript', function($resource){
        return $resource('simulate/poe-teacher-script.json', {}, {
            query: {
                method:'GET'
            }
        });
    }).
    factory('PoeMaterials', function($resource){
        return $resource('simulate/poe-materials.json', {}, {
            query: {
                method:'GET'
            }
        });
    });
