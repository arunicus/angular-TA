'use strict';

angular.module('myApp.value').value('assetcache', {
	assetMap:{},
	
	getAssetObject:function (insymbol){
		if(!this.assetMap[insymbol]){
			var asset = this.assetMap[insymbol] = new AssetModel();
            asset.symbol = insymbol;
		}
		return this.assetMap[insymbol];
	}
	
});