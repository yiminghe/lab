KISSY.use("node",function(S,Node){
	if(!S.UA.chrome){
		alert('please open with chrome!');
		return;
	}
	var worker= new Worker('worker.js');
	worker.onmessage=function(e){
		if(e.data.error){
		   alert(e.data.error);
		   progress.value=0;	
			 gen.disabled=false;
			 download.removeAttribute('download');
			 download.removeAttribute('href');
		 }
		 else if(e.data.log){
		   console.log(e.data.log);
		 }
	   else if('progress' in e.data){
	      progress.value=e.data.progress;
	   } else if(e.data.href){
				download.href=e.data.href;
				download.download=e.data.fieldVal+'.xlsx';
				progress.value=100;	
				gen.disabled=false;
	   }
	};
	var $=Node.all;
	var $file=$('#file'),file=$file[0];
	var field=$('#field');
	var gen=$('#gen')[0];
	var download=$('#download')[0];
	var progress=$('#progress')[0];
	$('#gen').on('click',function(){
		
		var excel=file.files[0];
		if(!excel|| !S.endsWith(excel.name,'.xlsx')){
			alert('please select xlsx');
			return;
		}
		gen.disabled=true;
		
		var reader = new FileReader();
		
		reader.onload=function(e){
			progress.removeAttribute('value');
			var result=reader.result;
			result=result.substring(result.indexOf(',')+1);
			
			
			worker.postMessage({result:result,fieldVal:field.val().trim()});
			
		};
		reader.onerror=function(e){
			alert(e);
		};
		reader.readAsDataURL(excel);
	});
});