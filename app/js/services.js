'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

angular.module('myApp.services', []).
    service('Phone',[ 'tdauser',function(tdauser) {
          this.login = function(username,password,successFunction,loginFailure) {
          	               var url = 'https://apista.tdameritrade.com/apps/300/LogIn';
                        	 $.ajax({
                          	    url: url,
                          	    type: 'POST',
                          	    dataType: '',
                          	    data: 'userid=' + username + '&password=' + password + '&source=TST&version=1001',
                          	    success:function(data){
                                  alert('heree');
                                  console.log("parsing xml login response");
                                  var xml = parseXml(data);
                                  var jsonResponse = xmlToJson(xml);
                                  if(jsonResponse.amtd.result == 'OK'){
                                    //tdauser=jsonResponse.amtd["xml-log-in"];
                                    tdauser["session-id"] = jsonResponse.amtd['xml-log-in']['session-id'];
                                    tdauser.loggedin = true;
                                    successFunction(tdauser);
                                  }else{
                                    tdauser.loggedin = false;
                                    loginFailure(jsonResponse.amtd.error);
                                  }
                                  
                                },
                          	    error:loginFailure
                              });
                              	
                        };
  }]).service('Phone1', function() {
            this.reverse = function(name) {
                              return name.split("").join("");
                            };
  });
  
 