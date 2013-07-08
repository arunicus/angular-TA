'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

angular.module('myApp.services', []).
    service('Phone', function() {
      this.login = function(username,password,successFunction,loginFailure) {
      	var url = 'https://apis.tdameritrade.com/apps/300/LogIn';
	$.ajax({
	    url: url,
	    type: 'POST',
	    dataType: '',
	    data: 'userid=' + username + '&password=' + password + '&source=TST&version=1001',
	    success:successFunction,
	    error:loginFailure
        });
      	
      };
  }).service('Phone1', function() {
      this.reverse = function(name) {
        return name.split("").join("");
  };
  });
  
 