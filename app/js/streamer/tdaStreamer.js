/*  http://www.JSON.org/json2.js
    2011-10-19
    Public Domain.
*/    
var JSON;if(!JSON){JSON={}}(function(){function f(a){return a<10?"0"+a:a}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];if(i&&typeof i==="object"&&typeof i.toJSON==="function"){i=i.toJSON(a)}if(typeof rep==="function"){i=rep.call(b,a,i)}switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i){return"null"}gap+=indent;h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1){h[c]=str(c,i)||"null"}e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]";gap=g;return e}if(rep&&typeof rep==="object"){f=rep.length;for(c=0;c<f;c+=1){if(typeof rep[c]==="string"){d=rep[c];e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}else{for(d in i){if(Object.prototype.hasOwnProperty.call(i,d)){e=str(d,i);if(e){h.push(quote(d)+(gap?": ":":")+e)}}}}e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}";gap=g;return e}}"use strict";if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(a,b,c){var d;gap="";indent="";if(typeof c==="number"){for(d=0;d<c;d+=1){indent+=" "}}else if(typeof c==="string"){indent=c}rep=b;if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":a})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e==="object"){for(c in e){if(Object.prototype.hasOwnProperty.call(e,c)){d=walk(e,c);if(d!==undefined){e[c]=d}else{delete e[c]}}}}return reviver.call(a,b,e)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})()

/*
TDA Streamer API
*/
if(typeof tda != "object"){
	tda = {adaptors:{}};
}
if(typeof tda.adaptors != "object"){
	tda.adaptors={};
}
if (!window.WebSocket && window.MozWebSocket){window.WebSocket = window.MozWebSocket;} // Mozilla has MozWebSocket instead of WebSocket
String.prototype.trim = function() {return this.replace(/^\s+|\s+$/, '');};
tda.adaptors.tdaStreamerGlobals = {streamer:null,deleteStreamer:function(){delete this.streamer;}};

/*TDA Session for streaming*/
tda.adaptors.Session = function(authentication,urls,reconnectPattern){
	var account ;
	if(typeof authentication == 'object'){
		account = authentication.account;
	}
	else{
		return false;
	}
	var globals = tda.adaptors.tdaStreamerGlobals;
	if(!globals){
		return false;
	}
	//To prevent duplicate streamer object creation
	if(globals.streamer){
		if(!account || account==globals.streamer.getAccount()){
			//Return existing streamer object to make sure only one connection in JS Scope
			return globals.streamer;
		}
		//return error in JS Scope we can not allow two different accounts
		return false;
	}
	globals.streamer = this;
	var logCount = 0;
	var log = function(obj){if(DEBUG){
		if(typeof console == 'object' && typeof console.log==='function'){console.log(obj); }
		if(document.getElementById("debug")){
			if(logCount++ >= 25){document.getElementById("debug").value= ""; logCount = 0;}
			document.getElementById("debug").value+= ((typeof obj == 'object')?JSON.stringify(obj):obj)+"\n" ;
		}
	}};
	
	
	var onMessage=[], onLogin=[], onError=[], onLogout=[], onBeforeUnload;
	
	var websocket=null;
	
	this.getAccount=function(){return account;}; //To know which account is being used in current streamer
	var subscriptions = {}, subscription,  requests=[], reconnectCue = [];
	
	var reconnect = true, debugInfo = [], STREAMER_URL = urls.http, WS_STREAMER_URL = (window.WebSocket && window.WebSocket.prototype.isFlashSocket ? urls.flash : urls.ws);
	var NOT_LOGGED_IN=0, LOGGED_IN=1, CONNECTING=2, DISCONNECTING=3;
	var loginStatus=NOT_LOGGED_IN, lastResponseTime=0, login_timeOut=null, loginAttempts=0,DEBUG=0, diagnosticInfo={},everConnected = false;
	if(!reconnectPattern){
		reconnectPattern=[{attempt:5,seconds:2},{attempt:2,seconds:5}];
	}
	//tempalate For login request
	var source = authentication.source;
	var getAuthParam = function(auth){ 
		return {
			"service" : "ADMIN",
			"command" : "LOGIN",
			"requestid" : 0,
			"account" : auth.account,
			"source" : source,
			"parameters" : {
				credential: "userid="+ auth.userid + "&" +
							"token="+ auth.token + "&" +
							"company="+ auth.company + "&" +
							"segment="+ auth.segment + "&" +
							"cddomain="+ auth.cddomain + "&" +
							"usergroup="+ auth.usergroup + "&" +
							"accesslevel="+ auth.accesslevel + "&" +
							"authorized="+ auth.authorized + "&" +
							"acl="+ auth.acl + "&" +
							"timestamp="+ auth.timestamp + "&" +
							"appid="+ auth.appid,
				token:auth.token,
				version : "1.0"
			}
		}
	};
	var loginRequest = getAuthParam(authentication);

	var byId=function(id){return document.getElementById(id);};
	//Constants
	var SUCCESS_CODE=0;
	
	//debugMode
	this.setDebugMode=function(debug){
		DEBUG = debug;
	};
	
	var closeStreamer = function(){
		websocket && websocket.close();
		websocket =null;
		loginStatus=NOT_LOGGED_IN;
		globals.streamer.callStack(onLogout,{code:0,result:"success"});
	};
	
	//Update Auth Detauls Again
	this.updateAuthDetails = function(auth){
		loginRequest = getAuthParam(auth);
	},
	
	//Logout the streamer server
	this.logout = function(){
		for(var key in subscriptions){
			this.removeAllSymbols(key);
		}
		loginStatus=DISCONNECTING;
		reconnect = false;
	};
	var loginInitTimer = null;
	//Login & Login Retry method
	var login=function(){
		if(window.WebSocket){
			if(window.WebSocket.prototype.isFlashSocket ){
				diagnosticInfo.connectionType = "FlashSocket";
				debugInfo.push({msg:"Using FlashSocket",ws:WS_STREAMER_URL});
			} else {
				diagnosticInfo.connectionType = "WebSocket";
				debugInfo.push({msg:"Using WebSocket",ws:WS_STREAMER_URL});
			}
			
		} else {
			debugInfo.push({msg:"Using HTTP async"});
			diagnosticInfo.connectionType = "HTTP Async"
		}
		
		loginAttempts++;
		if(loginAttempts == 1){
			doLogin();
			return;
		}
		var tmpNum = 0;
		for(var len = reconnectPattern.length,i=0;i<len;i++){
			var obj = reconnectPattern[i], attempts = tmpNum+obj.attempt;
			if(loginAttempts <= attempts){
				login_timeOut && clearTimeout(login_timeOut);
				login_timeOut = setTimeout(doLogin,obj.seconds*1000);
				return;
			}
			tmpNum = attempts;
		}
		loginStatus=NOT_LOGGED_IN;
	};
	
	var doLogin=function(){
		if(loginStatus == LOGGED_IN){
			return;
		}
		globals.streamer.callStack(onLogin,{code:1, result:"Connecting"});
		loginInitTimer && clearTimeout(loginInitTimer);
		loginInitTimer = setTimeout(function(){
			globals.streamer.callStack(onError,{code:"LOGIN", text:"Login Failed"});
		},5000); // 5 Seconds Delay before sending error message 
	
		log("Login : Start "+new Date());
		loginStatus=CONNECTING;
		var request = {"requests":[loginRequest]};
		request =  JSON.stringify(request);
		sendRequest(request);
	};

	//Get New HttpRequest Object
	var getHttpRequestObject = function (){
		try {return new XMLHttpRequest();} catch(noway) {
			try {return new ActiveXObject('Microsoft.XMLHTTP');} catch(nuhuh) {
				try {return new ActiveXObject('MSXML2.XMLHTTP.6.0');} catch(nope) {
					throw new Error('Could not find supported version of XMLHttpRequest.');
                }
            }
        }
	};

	var ws_error = function (e){
		/*setTimeout(function(){
			var subscription;
			if(loginStatus == LOGGED_IN && websocket.readyState == 3){
				for(subscription in subscriptions){ // if we are reconnecting
					reconnectCue.push(subscription);
				}
				loginStatus = NOT_LOGGED_IN;
				globals.streamer.reconnect();
			}
		},1);*/
		//log(e);
	};

	var closeWs=function(){
		websocket && websocket.close();
		websocket=null;
	};
	//params = {format:json,success:successCallBack,error:errorCallBack}
	//default format is json
	var sendRequest = function(postData){
		log(postData);
		if(window.WebSocket){
			if(websocket && websocket.readyState == 1){
				 try{websocket.send(postData);}catch(e){log("Error while sending\n Ready state = " + websocket.readyState);log(e);}
			} else {
				if(diagnosticInfo.connectionType == "FlashSocket"){
					try{
						WebSocket.loadFlashPolicyFile(urls.flash.substring(0,urls.flash.lastIndexOf("/"))+":80");
					} catch (e){}
				}
				websocket = new WebSocket(WS_STREAMER_URL);
				if(diagnosticInfo.connectionType == "FlashSocket"){
					try{
						WebSocket.loadFlashPolicyFile(urls.flash.substring(0,urls.flash.lastIndexOf("/"))+":80");
					} catch (e){}
				}
				websocket.onopen = function(evt) {
					everConnected = true;
					websocket.send(postData);
				};
				websocket.onmessage = function(evt) {processMessage(evt.data); };
				websocket.onerror = function(evt) { 
					ws_error(evt) ;
				};
				websocket.onclose = function(e) {
					if(!everConnected ){
						if(WS_STREAMER_URL.indexOf("wss://")==0){
							WS_STREAMER_URL = WS_STREAMER_URL.replace("wss://","ws://");
						} else if(WS_STREAMER_URL.indexOf("ws://")==0) {
							WS_STREAMER_URL = WS_STREAMER_URL.replace("ws://","wss://");
						}
					}
					log("CLOSED");
					for(subscription in subscriptions){ // if we are reconnecting
						reconnectCue.push(subscription);
					}
					loginStatus = NOT_LOGGED_IN;
					if(reconnect){
						globals.streamer.callStack(onLogout,{code:1,result:"error",message:"Disconnected unexpectedly."});
						login();
					}
				};
				if(!onBeforeUnload){
					onBeforeUnload = true;
					var fn = window.onbeforeunload;
					window.onbeforeunload = function() {
						var str;
						if(typeof fn == 'function'){
							 str = fn();
						} 
						reconnect = false;
						onError = [];
						if(str){
							return str;
						}
					};
				}
			}
			return; //WebSocket is active just return;
		}

		var httpObj = getHttpRequestObject();
		httpObj.open("POST",STREAMER_URL,true);
		httpObj.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		httpObj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
		httpObj.send("request="+encodeURIComponent(postData));
		httpObj.onreadystatechange=function(){
			if (httpObj.readyState==4){
				if(httpObj.status==200){
					log(httpObj.responseText);
					var tmpArr = httpObj.responseText.split("\r\n");
					for(var i=0;i<tmpArr.length;i++){
						var response = tmpArr[i];
						response = JSON.parse(response);
						processMessage(response);
					}
				} else {
					login();
					//	error("",e);// ERROR in command
				}
			}
		};
		return;
	};
	this.sendRequest =sendRequest;
/**** Function manage subscriptions ******/
var removeFromList = function(stack,needle){ //Values will not have comma ","
	if(typeof needle == "string"){
		needle = needle.split(",");
	}
	for(var k in needle){
		for(var key in stack){
			if(needle[k]==stack[key]){
				stack.splice(key,1);
				break;
			}
		}
	}
	
	return stack;
};

var addToList = function(stack,needle){ //Values will not have comma ","
	if(typeof needle == "string"){
		needle = needle.split(",");
	}
	for(var k in needle){
		var isin = false;
		for(var key in stack){
			if(needle[k]==stack[key]){
				isin = true;
				break;
			}
		}
		if(isin) delete needle[k];
	}
	for(var k in needle){
		stack.push(needle[k]);
	}
	return stack;
};

/**** Function manage subscriptions ******/
var initDataId=function(dataID){
	if(typeof subscriptions[dataID]!="object"){
		subscriptions[dataID]={};
		subscriptions[dataID]["keys"]=[];
		subscriptions[dataID]["fields"]=[];
	}
};
var isEmptySubscriptions=function(){
	var empty = true;
	for(var key in subscriptions){
		if(subscriptions[key].keys && subscriptions[key].keys.length){
			empty = false;
			break;
		}
	}
	return empty;
}
var removeSubsSymbol = function(dataID,keys){
	initDataId(dataID);
	subscriptions[dataID]["keys"] = removeFromList(subscriptions[dataID]["keys"],keys);
};
var resetSubsFields = function(dataID,fields){
	initDataId(dataID);
	subscriptions[dataID]["fields"]=[];
	subscriptions[dataID]["fields"] = addToList(subscriptions[dataID]["fields"],fields);
};
var resetSubsSymbol = function(dataID,keys){
	initDataId(dataID);
	subscriptions[dataID]["keys"]=[];
	subscriptions[dataID]["keys"] = addToList(subscriptions[dataID]["keys"],keys);
};
var addSubsSymbol=function(dataID,keys,fields){
	initDataId(dataID);
	subscriptions[dataID]["keys"] = addToList(subscriptions[dataID]["keys"],keys);
};
	var requestCompleted=function(reqId,content){
		if(content && content.code==SUCCESS_CODE){
			var request = requests[reqId];
			switch(request.command){
				case "SUBS":
					resetSubsSymbol(request.service,request.parameters.keys);
					resetSubsFields(request.service,request.parameters.fields);
					break;
				case "UNSUBS":
					if(!request.parameters.keys){
						resetSubsSymbol(request.service);
						if(!reconnect && isEmptySubscriptions()){
							closeStreamer();
						}
					}else{
						removeSubsSymbol(request.service,request.parameters.keys);
					}
					break;
				case "ADD":
					resetSubsFields(request.service,request.parameters.fields);
					addSubsSymbol(request.service,request.parameters.keys,request.parameters.fields);
					break;
				case "VIEW":
					resetSubsFields(request.service,request.parameters.fields);
					break;
				case "GET":
					break;
			}
		}
		delete requests[reqId];
	};

	var processMessage=function (data){
		log(data);
		if(typeof data == "string"){
			try{
				data = JSON.parse(data);
			} catch (e){
				return;
			}
		}
		if(data.data){
			processData(data.data);
		} else if(data.response) {
			processControl(data.response);
		}
		return this;
	};
	var processData = function(response){
		for(var i=0;i<response.length;i++){
			var data = response[i];
			lastResponseTime = data.timestamp;
			switch(data.service){
			// We dont have special case handling so going default
				case "ACCT_ACTIVITY":
				case "QUOTE":
				case "OPTION":
					default:
					for(var j=0;j<data.content.length;j++){
						data.content[j].dataID = data.service;
						publishMessage(data.content[j]);
					}
			}
		}
	};
	var initStream = function (){
		if(window.WebSocket) {return;}// For websocket we dont need to init stream
			if(byId("tdaFrameStreamerData")){
				/* var frame = document.createElement('iframe');
				frame.id = 'tdaFrameStreamerData';
				frame.name = 'tdaFrameStreamerData';
				frame.style.display="none";
				document.body.appendChild(frame); */
                    
				var frame = byId("tdaFrameStreamerData");
				frame.src= STREAMER_URL + '?request={"service":"ADMIN","requestid":"'+(requestId++)+'","command":"STREAM","account":"'+account+'","source":"'+source+'"}';
				var messageCount = 0, connTimeoutTimer;
				
				//Dont know where this is called. May be cleaning unwanted data
				globals.streamer.deleteScript = function(scriptID){
					var drScript = window.tdaFrameStreamerData.document.getElementById(scriptID);
					if (drScript.removeNode){ drScript.removeNode();}
					else{drScript.parentNode.removeChild(drScript);}
					
					if(messageCount++ >= 500){
						var brs = window.tdaFrameStreamerData.document.getElementsByTagName("br");
						if(brs[0].removeNode){
							for(var br in brs){
								brs[br].removeNode();
							}
						}else{
							 for(var br in brs){
								drBr = 	brs[br];
								drBr.parentNode.removeChild(drBr);
							} 
						}
						messageCount = 0;
					}
					if(connTimeoutTimer != null){clearTimeout(connTimeoutTimer);}
					connTimeoutTimer = setTimeout(function(){
						//document.body.removeChild(byId("tdaFrameStreamerData"));
						log("CLOSED");
						for(subscription in subscriptions){ // if we are reconnecting
							reconnectCue.push(subscription);
						}
						loginStatus = NOT_LOGGED_IN;
						if(reconnect){
							login();
						}
					},15000);
				return this;
				};
			}
		return;
	};
	var processControl = function(response){
	 for(var i=0;i<response.length;i++){
			var data = response[i];
			lastResponseTime = data.timestamp;
			switch(data.command){
				case "LOGIN":
					debugInfo.push(data);
					if(data.content){
						switch(data.content.code){
							case SUCCESS_CODE:
								loginStatus=LOGGED_IN;
								diagnosticInfo.server=data.content.msg;
								diagnosticInfo.activeSince = data.timestamp;
								initStream();
								if(login_timeOut != null){clearTimeout(login_timeOut);}
								log("<b>Logged In</b>");
								globals.streamer.callStack(onLogin,{code:0,result:"success"});
								loginAttempts=0;
								if(reconnect){
									globals.streamer.callStack(onLogin,{code:2, result:"Reconnected"});
								} else {
									reconnect = true;
								}
								processRecconect();
								break;
							case 13:  // Is for server info
								
								break;
							case 30:	//STOP_STREAMING 
							case 31:	//QOS_SLOW_DOWN 
							case 32:	//QOS_SPEED_UP	
								reconnect = false;
								break;
							default:
								loginStatus=NOT_LOGGED_IN;
								// Code to call onError
								globals.streamer.callStack(onError,{code:"LOGIN", text:"Login Failed"});		
						}
					} else {
							loginStatus=NOT_LOGGED_IN;
							// Code to call onError
							globals.streamer.callStack(onError,{code:"LOGIN", text:"Login Failed"});
					}
					break;
				default:
					requestCompleted(data.requestid,data.content);
			}
		}
	};
	var publishMessage= function(message){
		message.get=function(ind){if(typeof this[ind]!='undefined'){return this[ind];} else return null;}
		//message.getString=function(ind){if(typeof this[ind!='undefined'){return this[ind].toString()} else return null;}
		globals.streamer.callStack(onMessage,message);
	};
	var processRecconect = function(){
		var subscription;
		while(subscription = reconnectCue.shift()){
			if(subscriptions[subscription].keys && subscriptions[subscription].keys.length){
				globals.streamer.addSymbol(subscription, subscriptions[subscription].keys.join(","), subscriptions[subscription].fields.join(","));
			}
		}
		
		return;
	};
	var requestId = 1;
	var executeCommand = function(command, dataID, keys, fields){

		if(loginStatus == LOGGED_IN || true){
			var request ={"service":dataID,"command":command,"requestid":(requestId),"account":account,"source":source,"parameters":{}}
			if(keys){
				request.parameters.keys = keys;
			}
			if(fields){
				request.parameters.fields = fields;
			}
			requests[requestId]=request;
			requestId++;
			sendRequest(JSON.stringify(request));
		}
	};
	this.executeCommand = executeCommand;
	var connectionClosed = function(){
		log("Stream is closed");
	};
	this.startNewSymbol=function(dataID, symbols, fields){
		executeCommand('SUBS',dataID, symbols, fields);
	};
	this.addSymbol=function(dataID, symbols, fields){
		executeCommand('ADD',dataID, symbols, fields);
	};
	this.removeSymbol=function(dataID, symbols){
		executeCommand('UNSUBS',dataID, symbols);
	};
	this.removeAllSymbols=function(dataID){
		executeCommand('UNSUBS',dataID);
	};
	this.setFields=function(dataID, fields){
		executeCommand('VIEW',dataID, null, fields);
	};
	this.getInitData = function(dataID, fields){ // Not Done Yet
		executeCommand('GET',dataID, null, fields);
	};

	this.onLogout = function (fn,nameSpace){
		var matched=false;
		for(var i=0;i<onLogout.length;i++){
			if(onLogout[i].fn === fn){
				matched=true;
				break;
			}
		}
		if(!matched){
			onLogout.push({"fn": fn, "nameSpace": (typeof nameSpace == "string" ? nameSpace : "")});
		}
		return;
	};
	
	this.onLogin = function (fn,nameSpace){
		var matched=false;
		for(var i=0;i<onLogin.length;i++){
			if(onLogin[i].fn === fn){
				matched=true;
				break;
			}
		}
		if(!matched){
			onLogin.push({"fn": fn, "nameSpace": (typeof nameSpace == "string" ? nameSpace : "")});
		}
		return;
	};
	
	this.onError = function (fn,nameSpace){
		var matched=false;
		for(var i=0;i<onError.length;i++){
			if(onError[i].fn === fn){
				matched=true;
				break;
			}
		}
		if(!matched){
			onError.push({"fn": fn, "nameSpace": (typeof nameSpace == "string" ? nameSpace : "")});
		}
		return;
	};
	
	
	this.callStack = function(stack,param){
		//trying to reset the login Timer
		if(loginInitTimer){ 
			clearTimeout(loginInitTimer);
		}
		for(var i=0;i<stack.length;i++){
			if(typeof stack[i].fn === 'function'){
				stack[i].fn(param);
			}
		}
	}
	
	this.login = login;
	this.newMessage = processMessage;
	this.onMessage = function (fn,nameSpace){
		var matched=false;
		for(var i=0;i<onMessage.length;i++){
			if(onMessage[i].fn === fn){
				matched=true;
				break;
			}
		}
		if(!matched){
			onMessage.push({"fn": fn, "nameSpace": (typeof nameSpace == "string" ? nameSpace : "")});
		}
		return;
	};
	this.offMessage = function(nameSpace){
		var i = 0;
		while(i < onMessage.length){
			if(onMessage[i].nameSpace == nameSpace){
				onMessage.splice(i, 1);
			}
			else i++;
		}
		return;
	};
	this.reconnect = function(){
		login();
	};
	this.getDebugInfo=function(){
		return {lastResponseTime:lastResponseTime, debugInfo:debugInfo};
	};
	this.getDiagnosticInfo=function(){
		return {	
				lastResponseTime:lastResponseTime,
				server:diagnosticInfo.server, 
				account:account,
				activeSince:diagnosticInfo.activeSince, 
				connectionType:diagnosticInfo.connectionType,
				subscriptions:subscriptions
				}
	};
}
if(!document.getElementById("tdaFrameStreamerData")){
	(function(){
		var iFrameStr = '<iframe width="300" height="500" id="tdaFrameStreamerData" name="tdaFrameStreamerData" style="display: none;" ></iframe>';
		if(document.body){
			var tdaStreamerdiv = document.createElement('div');
			document.body.appendChild(tdaStreamerdiv);
			tdaStreamerdiv.innerHTML = iFrameStr;
			tdaStreamerdiv.style.display="none";
		}else{
			document.write(iFrameStr);
		}
	})();
}
