/**
 * 右侧便民中心的逻辑
 */
FP.add('expressway',function(S){
	S.namespace('Expressway');
	S.Expressway.init = function(){
		var announce = new S.Tabs("#J_announce",{aria:true});
		/*
		var announceLoad = new S.DataLazyload({
			mod:'auto',
			areaes:S.one('#J_announce').all('textarea')
		});
		*/
		if(!S.one("#J_expressway")){
			return;
		}
		
		var expressway = new S.Tabs("#J_expressway",{
		    aria:true,
			//navCls: 'tab-holder',
			//contentCls: 'bd',
			//activeTriggerCls: 'selected',
			activeIndex: parseInt(S.get('#J_expressway').getAttribute('data-active-index')) || 0
		});
				
		/*
		var tabIfram = new S.DataLazyload({
			mod:'auto',
			areaes:S.one('#J_expressway').all('textarea')
		});	
		*/
	};

});
