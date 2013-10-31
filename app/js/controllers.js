'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', ['$location','$scope','Phone','Phone1' , function($location,$scope,greeter,greeter1) {
  	$scope.view2 = "partials/partial2.html";
  
  	$scope.loginSubmit = function() {
	    //alert('submit login ' + $scope.username);
	    greeter.login($scope.username,$scope.password,$scope.loginSuccess,$scope.loginFailure);
	    
  	};
  	
  	$scope.loginSuccess = function(tdauser) {
		// convert data in JSON from XML
		// Save Response
      $location.path('/view2');
      $scope.$apply();
  	};
  	
  	$scope.loginFailure = function(message) {
		    alert(message);
  	};
  	
  	

  }])
  .controller('MyCtrl2', ['$location','tdauser','userwatchlist','$scope','watchservice',
      function($location,tdauser,userwatchlist,$scope,watchservice) {

      $scope.init = function(){
        if(tdauser.loggedin){
         watchservice.getwatchservice($scope.getWatchListSuccess,$scope.getWatchListSuccess);
        }else{
          console.log('not logged');
          $location.path('/login');
        }

      };
      $scope.init();

      $scope.getWatchListSuccess = function() {
      };

  }]);