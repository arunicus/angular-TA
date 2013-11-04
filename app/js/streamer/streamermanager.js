var app;


function getSteamerInfo(app) {
	app = app;
	var url = app.apiUrl+'/apps/200/StreamerInfo;jsessionid='+app.userProfileModel.get('session-id');
	$.ajax({
		url:url,
		type:'POST',
		dataType:'',
		data:'source=TAG',
		success:function(data) {
			// convert data in JSON from XML
			// Save Response
			console.log("parsing xml login response");
			console.log(data);
			var xml = parseXml(data);

			var jsonResponse  = xmlToJson(xml);

			if ( jsonResponse.amtd.error ){
				alert(JSON.stringify(jsonResponse.amtd.error));
			}
			else
			{
                var acct;
                if(app.userProfileModel.get("accounts").account.length){
                     acct =      app.userProfileModel.get("accounts").account[0];
                }else{
                    acct =      app.userProfileModel.get("accounts").account;
                }
				app.streamerconfig = new Object();
				var info = jsonResponse.amtd["streamer-info"];
				app.streamerconfig.account =acct["account-id"];
				app.streamerconfig.userid =acct["account-id"];
				app.streamerconfig.token = info.token;
				app.streamerconfig.company =acct["company"];
				app.streamerconfig.source ='TAG-1234';
				app.streamerconfig.segment =acct["segment"];
				app.streamerconfig.cddomain =acct["cdi"];
				app.streamerconfig.usergroup =info.usergroup;
				app.streamerconfig.accesslevel =info["access-level"];
				app.streamerconfig.authorized =info.authorized;
				app.streamerconfig.acl =info.acl;
				app.streamerconfig.timestamp =info.timestamp;
				app.streamerconfig.appid = 'TAG';
				//var connectionData = JSON.parse(document.getElementById("connectionDataText").value);
				//if(connectionData.content){
					//connectionData = connectionData.content;				
				//}

                //QA npeqae-streamer-web.ameritrade.com
                /*app.streamer = new tda.adaptors.Session( app.streamerconfig, {
                    "http" : "http://npeqae-streamer-web.ameritrade.com/ws",
                    "ws" :  "ws://npeqae-streamer-web.ameritrade.com/ws",
                    "flash" : "ws://npeqae-streamer-web.ameritrade.com/ws",
                });*/
                //Prod
				app.streamer = new tda.adaptors.Session( app.streamerconfig, {
						"http" : "http://tdameritrade-web.streamer.com/ws",
						"ws" :  "ws://tdameritrade-web.streamer.com/ws",
						"flash" : "ws://tdameritrade-web.streamer.com/ws",
						});
				app.streamer.setDebugMode(true);
				app.streamer.onMessage(onMessage,"default");
				app.streamer.onLogin(loginUpdate);
				app.streamer.onError(streamerError);
				app.streamer.login();			 	
			}
		},
		error:function(data){
			console.log(data);
		}
	});
}

function loginUpdate(message){
	console.log(message);
}

function streamerError(message){
	console.log(message);
}

function onMessage(message){
	console.log(message);
}

//pass comma seperated symbols for level1 quote subscription
function addLevel1QuoteSubscription(symbols){
	if(app.streamerLoggedIn){
		symbols = symbols.toUpperCase();
		var fields = "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,22,23,24,25,28,29,30,31,32,37,38,39";
		var dataID = "QUOTE";
		app.streamer.addSymbol(dataID, symbols, fields);
	}else{
		alert('not logged on');
	}
}

//pass comma seperated symbols for level1 quote subscription
function addChartBarsSubscription(symbols){
	if(app.streamerLoggedIn){
		symbols = symbols.toUpperCase();
		var fields = "0,1,2,3,4,5,6,7";
		var dataID = "CHART";
		app.streamer.addSymbol(dataID, symbols, fields);
	}else{
		alert('not logged on');
	}
}

//pass comma seperated symbols for level1 quote subscription
function unSubscribeLevel1QuoteSubscription(symbols){
	symbols = symbols.toUpperCase();
	var dataID = "QUOTE";
	app.streamer.removeSymbol(dataID, symbols);
}

//pass comma seperated symbols for level1 quote subscription
function unSubscribeAddChartBars(symbols){
	symbols = symbols.toUpperCase();
	var dataID = "CHART";
	app.streamer.removeSymbol(dataID, symbols);
}