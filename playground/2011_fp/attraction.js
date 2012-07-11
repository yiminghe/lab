FP.add('attraction',function(S){
	S.namespace('Attraction');

	S.Attraction.init = function(){
		var DOM = S.DOM,
			Node=S.Node,
			ieEngine = document.documentMode||S.UA.ie;
		var slider = S.Slide('#J_Slide', {
			effect: 'scrolly',
			navCls:"tb-slide-triggers",
			easing: 'easeOutStrong',
			activeIndex:0,
			aria:true
		});
		/**
		圆角 for ie6,7,8 use vml
		@author:yiminghe@gmail.com
		*/
		if (ieEngine<9) {
			var normalColor,
				activeColor;
				function attr(el,cs){                			
					for(var c in cs){
						if(cs.hasOwnProperty(c)){
							//ie8 need
							el[c]=cs[c];
						}
					}
				}
			if (!document.namespaces.v) {
				document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
			}
			var css = document.createStyleSheet();
			//ie8 : no v\\:*
			css.addRule("v\\:roundrect", "behavior: url(#default#VML);display:inline-block;");
			var licon=S.one("#J_Slide .tb-slide-triggers");
			//wierd vml render ,last always last
			licon.append("<li style='display:none'>");
			var lis = licon.all("li");       
			lis.each(function(li,index) {
				try {                        	
					var bgColor = li.css("background-color"),
					width=li.css("width"),iWidth=parseInt(width,10);
					
					if(index == slider.activeIndex && !activeColor){
						activeColor=bgColor;
					}else if(!normalColor){
						normalColor=bgColor;
					}
					var rect = document.createElement('v:roundrect');
					attr(rect, {
						arcsize:width,
						//strokecolor:"#000",
						//strokeweight:"1px",
						stroked:false,                             
						fillcolor:bgColor
					});
					DOM.css(rect, {
						position:"absolute",
						top:0,
						left:0,
						width:width,
						height:width,                                                         
						antialias:true,
						//opacity:bgColor==normalColor?0.7:1,
						zIndex:-1
					});                           
					li.append(rect);
					//rect.outerHTML =rect.outerHTML ;
					li.css({
						"backgroundColor":"transparent",
						"padding-left":1,
						"padding-top":1,
						"width":((iWidth-1)+"px"),
						"height":((iWidth-1)+"px")
					});
				} catch(e) {
				}
			});		
			
			
			slider.on("beforeSwitch", function(ev) {			    
				var currentfill = S.get("roundrect",lis[this.activeIndex]);
				var fill = S.get("roundrect",lis[ev.toIndex]);
				attr(currentfill,{
					fillcolor:normalColor,
					strokecolor:normalColor
				});
				//DOM.css(currentfill,"opacity",0.7);     
				attr(fill,{
					fillcolor:activeColor,
					strokecolor:activeColor
				});
				currentfill = fill;
				//DOM.css(currentfill,"opacity",1);         
			});		
			
		}

        //商城滚动消息
		 var h = new S.Carousel("#J_RotateList", {
		    aria:true,
			effect: "scrollx",
			hasTriggers: false,
			autoplay: true,
			interval: 4,
			prevBtnCls:'rotate-prev',
			nextBtnCls:'rotate-next',
			easing:'easeBothStrong',
            activeIndex: parseInt(S.DOM.get('#J_RotateList').getAttribute('data-active-index')) || 0,
			viewSize: [260]
		});
        
		//商城横向滚动
		var hh = new S.Carousel("#J_MallSlide", {
		    aria:true,
			effect: "scrollx",
			hasTriggers: false,
			//autoplay: true,
			//interval: 5,
			prevBtnCls:'mall-prev',
			nextBtnCls:'mall-next',
			easing:'easeOutStrong',
			activeIndex: parseInt(S.DOM.get('#J_MallSlide').getAttribute('data-active-index')) || 0,
			viewSize: [440]
		});
	
	};
	
});
