'use strict';


angular.module('myApp.services').
    service('streamerservice',[ 'streamerinfo','tdauser',function(streamerinfo,tdauser) {
          this.getstreamerinfo = function(successFunction,loginFailure) {
          	               var url = 'https://apista.tdameritrade.com/apps/200/StreamerInfo;jsessionid='+ tdauser["session-id"];
                        	 $.ajax({
                          	    url: url,
                          	    type: 'POST',
                          	    dataType: '',
                          	    data: 'source=TAG',
                          	    success:function(data){
                                  console.log("parsing xml getstreamerinfo response");
                                  var xml = parseXml(data);

                                  var jsonResponse  = xmlToJson(xml);

                                  if ( jsonResponse.amtd.error ){
                                    alert(JSON.stringify(jsonResponse.amtd.error));
                                  }
                                  else
                                  {
                                      var acct;
                                      if(tdauser.userProfileModel.accounts.account.length){
                                           acct = tdauser.userProfileModel.accounts.account[0];
                                      }else{
                                          acct = tdauser.userProfileModel.accounts.account;
                                      }
                                      streamerinfo.streamerconfig = new Object();
                                      var info = jsonResponse.amtd["streamer-info"];
                                      streamerinfo.streamerconfig.account =acct["account-id"];
                                      streamerinfo.streamerconfig.userid =acct["account-id"];
                                      streamerinfo.streamerconfig.token = info.token;
                                      streamerinfo.streamerconfig.company =acct["company"];
                                      streamerinfo.streamerconfig.source ='TAG-1234';
                                      streamerinfo.streamerconfig.segment =acct["segment"];
                                      streamerinfo.streamerconfig.cddomain =acct["cdi"];
                                      streamerinfo.streamerconfig.usergroup =info.usergroup;
                                      streamerinfo.streamerconfig.accesslevel =info["access-level"];
                                      streamerinfo.streamerconfig.authorized =info.authorized;
                                      streamerinfo.streamerconfig.acl =info.acl;
                                      streamerinfo.streamerconfig.timestamp =info.timestamp;
                                      streamerinfo.streamerconfig.appid = 'TAG';

                                      streamerinfo.streamer = new tda.adaptors.Session( streamerinfo.streamerconfig, {
                                          "http" : "http://tdameritrade-web.streamer.com/ws",
                                          "ws" :  "ws://tdameritrade-web.streamer.com/ws",
                                          "flash" : "ws://tdameritrade-web.streamer.com/ws",
                                          });
                                      streamerinfo.streamer.setDebugMode(true);
                                      streamerinfo.streamer.onMessage(onMessage,"default");
                                      streamerinfo.streamer.onLogin(loginUpdate);
                                      streamerinfo.streamer.onError(streamerError);
                                      streamerinfo.streamer.login(); 

                                  }
                                },
                          	    error:loginFailure
                              });
                              	
                        };
  }]);
  
 