function StreamerResponseReaderHelper() {

	this.quoteReaderMap={
		1:"bid",
		2:"ask",
		3:"last",
		4:"bidSize",
		5:"asKSize",
		8:"volume",
		9:"lastSize",
		10:"tradeTime",
		11:"quoteTime",
		12:"high",
		13:"low",
		14:"tick",
		15:"close",
		16:"exchange",
		24:"volatility",
		21:"description",
		30:"yearHigh",
		31:"yearLow",
		32:"peRatio",
		33:"divAmount",
		34:"divYield",
		40:"divDate",
		29:"change",
		28:"open"
	};
	
	this.getquoteReaderMap=function (quoteId){
		return this.quoteReaderMap;
	}
}