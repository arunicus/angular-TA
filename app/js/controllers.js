'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', ['$location','$scope','Phone','Phone1' , function($location,$scope,greeter,greeter1) {
  	$scope.test = "testing";
  
  	$scope.loginSubmit = function() {
	    //alert('submit login ' + $scope.username);
	    greeter.login($scope.username,$scope.password,$scope.loginSuccess,$scope.loginFailure);
	    
  	};
  	
  	$scope.loginSuccess = function(data) {
		// convert data in JSON from XML
		// Save Response
		console.log("parsing xml login response");
		var xml = parseXml(data);
		var jsonResponse = xmlToJson(xml);
		console.log(jsonResponse);
  	};
  	
  	$scope.loginFailure = function(data) {
		console.log(data);
  	};
  	
  	

  }])
  .controller('MyCtrl2', [function() {

  }]);