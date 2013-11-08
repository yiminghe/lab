importScripts('jszip.js');
importScripts('jszip-load.js');
importScripts('jszip-deflate.js');
importScripts('jszip-inflate.js');
importScripts('xlsx.js');
self.onmessage=function(e){
	var result=e.data.result;
	var content = xlsx(result);
			var sheets=content.worksheets;
			var fieldVal=e.data.fieldVal;
			var row0=sheets[0].data[0];
			var fieldCol=-1;
			for(var i=0;i<row0.length;i++){
			  if(row0[i].value.trim()==fieldVal){
			  	fieldCol=i;
			  	break;
			  }
			}
			self.postMessage({log:"fieldCol: "+fieldCol});
			if(fieldCol==-1){
				self.postMessage({error:"field is invalid!"});
				return;
			}
	var newWorkSheet=[];
			var sheet0data=sheets[0].data;
			newWorkSheet[0]=sheet0data[0].concat([]);
			newWorkSheet[0].unshift({
				formatCode: "General",
				value: "worksheet"
			});
			var sheet1afterdata=sheet0data.slice(1);
			sheet1afterdata.sort(function(a1,a2){
				  var v1=a1[fieldCol].value.trim();
				  var v2=a2[fieldCol].value.trim();
				  if(v1>v2) return 1;
				  if(v1<v2) return -1;
				  return 0;
			});
			var rowCount=sheet1afterdata.length;
			for(var i=0;i<sheet1afterdata.length;i++){
				do{
					var val=sheet1afterdata[i][fieldCol].value.trim();
					var r=sheet1afterdata[i].concat([]);
					r.unshift({
						formatCode: "General",
						value: sheets[0].name
					});
					newWorkSheet.push(r);
					if(i==sheet1afterdata.length-1){
						++i;
						break;
					}
			  }while(val==sheet1afterdata[++i][fieldCol].value.trim());
			  --i;
			  
			  for(var j=1;j<sheets.length;j++){
				  var otherRows=sheets[j].data;
				  for(var k=1;k<otherRows.length;k++){
				     var otherVal=otherRows[k][fieldCol].value;
				     if(val==otherVal.trim()){
				     	  var r=  otherRows[k].concat([]);
				     		r.unshift({
									formatCode: "General",
									value: sheets[j].name
								});
								newWorkSheet.push(r);
				     } 
				  }
				}
				//self.postMessage({progress:Math.round(i/rowCount*100),log:Math.round(i/rowCount*100)+'-'+Date.now()});
				
}
      self.postMessage({log:'construct xlsx'})
			var href=xlsx({
					worksheets:[
						{
							 name:fieldVal,
							 data:newWorkSheet
						}
					]
				}).href();
				self.postMessage({log:'seed xlsx to client'});
				self.postMessage({href:href,fieldVal:fieldVal});
};