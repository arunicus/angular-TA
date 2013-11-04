'use strict';


angular.module('myApp.services').
    service('watchservice',[ 'userwatchlist','assetcache','tdauser',function(userwatchlist,assetcache,tdauser) {
          this.getwatchservice = function(successFunction,loginFailure) {
          	               var url = 'https://apista.tdameritrade.com/apps/100/GetWatchlists;jsessionid='+ tdauser["session-id"];
                        	 $.ajax({
                          	    url: url,
                          	    type: 'POST',
                          	    dataType: '',
                          	    data: 'accountid=149137211&source=TAG',
                          	    success:function(data){
                                  console.log("parsing xml getwatchservice response");
                                  var xml = parseXml(data);
                                  var jsonResponse  = xmlToJson(xml);

                                  if ( jsonResponse.amtd.error ){
                                    alert(JSON.stringify(jsonResponse.amtd.error));
                                  } 
                                  else
                                  { 
                                     userwatchlist.watchListMap = {};
                                     var watchlists = jsonResponse.amtd["watchlist-result"]["watchlist"];
                                      for(var i=0;i <watchlists.length;i++){
                                        var wl = watchlists[i];
                                        var id = wl.id;
                                        var name = wl.name;
                                        var wlc = new Array();
                                        userwatchlist.watchListMap[name] = wlc;
                                        
                                        var wlsymbol = wl["symbol-list"]["watched-symbol"];
                                        for(var j=0;j <wlsymbol.length;j++){
                                          var symboldetails = wlsymbol[j];
                                          var avgPrice = symboldetails["average-price"];
                                          var quantity = symboldetails["quantity"];
                                          var assetType = symboldetails["security"]["asset-type"];
                                          var desc = symboldetails["security"]["description"];
                                          var symbol = symboldetails["security"]["symbol"];
                                          var wlObj = {symbol:symbol,description:desc};
                                          wlObj.asset = assetcache.getAssetObject(symbol);
                                          wlObj.asset.bid = "0.01";
                                          wlc.push(wlObj);
                                        }
                                      }
                                    
                                  }
                                  userwatchlist.watchlistloaded = true;
                                  successFunction(userwatchlist);
                                },
                          	    error:loginFailure
                              });
                              	
                        };
  }]);
  
 