'use strict';


angular.module('myApp.services').
    service('watchservice',[ 'userwatchlist','tdauser',function(userwatchlist,tdauser) {
          this.getwatchservice = function(successFunction,loginFailure) {
          	               var url = 'https://apista.tdameritrade.com/apps/100/GetWatchlists;jsessionid='+ tdauser["session-id"];
                        	 $.ajax({
                          	    url: url,
                          	    type: 'POST',
                          	    dataType: '',
                          	    data: 'accountid=149137211&source=TAG',
                          	    success:function(data){
                                  alert('heree');
                                  console.log("parsing xml login response");
                                  
                                },
                          	    error:loginFailure
                              });
                              	
                        };
  }]);
  
 