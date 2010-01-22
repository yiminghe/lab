Ext.onReady(function(){
	var id=1;
	chrome.extension.sendRequest({msg:"get"},function(response){
			if(!response.cities) return;
	  	console.log("get response from extension:"+id);
	  	var cities="("+response.cities.join("|")+")";
	  	console.log("get response from extension "+cities+" :"+id++);
	  	Ext.select("a.ptitle").each(function(el){
	  		el.update(highlight(el.dom.innerHTML,cities));
	  	});
	});
	function highlight(title,cities) {
		//no chinese please,use unicode
		if(title.indexOf("\u6c42")!=-1) return title;
		return title.replace(new RegExp(cities,"g"),"<span style=\"font-weight:bold;color:blue;\">$1</span>")
	}
}); 