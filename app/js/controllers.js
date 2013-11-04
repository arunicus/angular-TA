'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', ['$location','$scope','Phone','streamerservice' , function($location,$scope,greeter,streamerservice) {
  	$scope.view2 = "partials/partial2.html";
    $scope.username = "aruntrade01";
    $scope.password = "test123";
  
  	$scope.loginSubmit = function() {
	    //alert('submit login ' + $scope.username);
	    greeter.login($scope.username,$scope.password,$scope.loginSuccess,$scope.loginFailure);
	    
  	};
  	
  	$scope.loginSuccess = function(tdauser) {
		// convert data in JSON from XML
		// Save Response
      streamerservice.getstreamerinfo($scope.streamerSuccess,$scope.streamerFailure);
      $location.path('/view2');
      $scope.$apply();
  	};
  	
  	$scope.loginFailure = function(message) {
		    alert(message);
  	};

    $scope.streamerSuccess = function(tdauser) {
        alert('success');      
    };
    
    $scope.streamerFailure = function(message) {
        alert(message);
    };
  	
  	

  }])
  .controller('MyCtrl2', ['$location','tdauser','userwatchlist','$scope','watchservice',
      function($location,tdauser,userwatchlist,$scope,watchservice) {
      $scope.wlarray = new Array();
      $scope.getWatchListSuccess = function(userwatchlist) {
        console.log(userwatchlist.watchlistloaded);
        for(var key in userwatchlist.watchListMap){
          var coll = userwatchlist.watchListMap['default'];
          console.log(coll.length);
          $scope.wlarray = $scope.wlarray.concat(coll);
                    console.log($scope.wlarray.length);
          break;
        }
      };
      $scope.init = function(){
        if(tdauser.loggedin){
          if(userwatchlist.watchlistloaded  == true){
              $scope.getWatchListSuccess(userwatchlist);
          }else{
              watchservice.getwatchservice($scope.getWatchListSuccess,$scope.getWatchListSuccess);
          }
        }else{
          console.log('not logged');
          $location.path('/login');
        }

      };
      $scope.init();

      

  }]);