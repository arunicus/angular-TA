
function AssetModel (){
		symbol="";
		bid="";
		ask="";
		last="";
		change="";
		high="";
		volume="";
		changePercent="";
		dayRange="";
		description="";
		assetType="";
	initialize= function(){
		console.log(" initialise watch list object");

	};
	
	dayRange= function(){
		return this.get('low') + " - " +this.get('high');
	};
	
	yearRange= function(){
		return this.get('yearLow') + " - " +this.get('yearHigh');
	};
	
	yearRangeBoxes= function(){
		var resp = "";
		var diff = (this.get('yearHigh') - this.get('yearLow') )/10
		var val1 = this.get('yearLow');
		var val2 = this.get('yearLow')+diff ;
		for(var i=0;i < 10 ; i++){
			if(this.get('last') > val1 && this.get('last') < val2){
				resp  = resp + "<p class='blackbox'>";				
			}else{
				resp  = resp + "<p class='greybox'>";
			}
			val1 = val1+diff;
			val2 = val2+diff;
		}
		
		return resp;
	};
	
}