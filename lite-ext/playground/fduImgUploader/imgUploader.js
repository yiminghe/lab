Ext.onReady(function() {
	
	var upload=Ext.DomHelper.append(Ext.getBody(),{
		tag:"div",
		cls:"uploadImgEnhancement",
		cn:[{
			tag:"button",
			html:"upload img"
		}]
	},true).child("button");
	upload.on("click",function(){
		mwindow.show({
			animateTarget:upload,
    		constrainToView:true
		});
	});
	
	var mwindow = new Ext.ux.WindowLite({
        width:500,
        height:500,
        modal:true,
		html:"<div id='tabpanel_test' class='tabpanel'>"+
		"	<div class='tabheader'>"+

			"<ul class='tabpanel_nav clearfix'>"+


					"<li class='tab_active'>"+
					"	<a class='tab_left' href='#' hideFocus='on'>"+
						"	<em class='tab_right'>"+
							"	<span class='tab_inner'>"+
								"	<span class='tab_text'>"+
									"tip"+
								"	</span>"+
								"</span>"+
						"	</em>"+
						"	</a>"+
					"</li>"+
						"</ul>"+

					"</div>"+

				 "<div class='panels'>"+

					"<div class='panel'>"+

						"<div style='height:100px;'>"+
							"added images will be shown at Tabs "+
					"	</div>"+

					"</div></div>",
        drag:true,
        title:'please select images',
        maximizable:true,
         tools:[{
				        	cls:'x-tool tool-help',
				        	'click':function(evt){
				        		alert(" Version : 1.0;\n Author:yiminghe.javaeye.com;\n Date:20091222");
				        		evt.stopEvent();
				        	}
				        }],
        
        shadow:'frame',//默认sides
				shadowOffset:6,//默认4
        
        //是否有关闭按钮,默认true
        //closable :false,
        
        //设置默认焦点按钮
        //defaultButton:'AlertLite 1',
        //静态设置按钮       
        buttons:[
        {
        	text:'close',
        	handler:function(evt) {
        		mwindow.close();
        		evt.stopEvent();
        	}
        }
        ],
       
        //是否支持用户调节大小      	
        resizable:true
   });	
	
	var wrap=Ext.DomHelper.insertFirst(mwindow.body.dom,{
		tag:"div",
		style:{
			padding:"10px"
		}
	},true);
	
	var copy=Ext.DomHelper.append(wrap,{
		tag:"p",
		cn:[{
			tag:"button",
			html:"get all tab image links ,use ctrl a"
		}]
	},true).child("button");
	var textLinks=Ext.DomHelper.append(wrap,{
		tag:"p",
		cn:[{
			tag:"textarea",
			rows:5,
			style:{
				width:"95%"
			}
		}]
	},true).child("textarea");
	copy.on("click",function(){
		var images=tabPanel.panelContainer.select("img");
		var text=[];
		images.each(function(el){
			text.push(el.dom.src);
		});
		copyToClipboard(text.join("\n"));
	});
	
	function addForm(){
		var form=Ext.DomHelper.append(wrap,{
			tag:"form",
			method:"post",
			enctype:"multipart/form-data",
			action:"http://bbs.fudan.edu.cn/bbs/upload?b=PIC",
			cn:[{
				tag:"input",
				type:"file",
				name:"up",
				size:50
			}]
		},true);


		var input=form.child("input");
		function clear(){
			Ext.destroy(input);
			Ext.destroy(form);
			
		}
		input.on("change",function(){
			form.mask("uploading...");
			addForm();
			Ext.Ajax.request({
				form:form,
				success:function(response){
					//response.responseText="we <strong id=\"url\">http://bbs.fudan.edu.cn/upload/PIC/1261411452-6838.jpg</strong> zzz";
					if(response.responseText) {
						var result=response.responseText;
						var fileName=input.dom.value;
						var nameReg=/[^\/\\]+$/;
						var nameM=nameReg.exec(fileName);
						
						var reg=/<strong id="url">([^<]+)<\/strong>/;
						var m=reg.exec(result);
					  if(m&&m[1]&&nameM&&nameM[0])
						addTabImage(m[1],nameM[0]);
						else
							alert(stripTags(response.responseText));
					}
					form.unmask();
					clear();
				},
				failure:function(){
						var fileName=input.dom.value;
						var nameReg=/[^\/\\]+$/;
						var nameM=nameReg.exec(fileName);
						if(nameM&&nameM[0])
					alert("error : "+nameM[0]);
					else alert("error");
					form.unmask();
					clear();
				}
			});
		});
	}
	addForm();
	
	// private
        var stripTagsRE = /<\/?[^>]+>/gi;
        
        /**
         * Strips all HTML tags
         * @param {Mixed} value The text from which to strip tags
         * @return {String} The stripped text
         */
        function stripTags(v){
            return !v ? v : String(v).replace(stripTagsRE, "");
        }
	var tabPanel=new Ext.ux.TabPanelLite({containerId:'tabpanel_test'});
	
	
	function adJujust(){
		tabPanel.adjustScroll();
	}
	
	mwindow.on("maximize",adJujust);
	mwindow.on("restore",adJujust);
	mwindow.on("resize",adJujust);
	
	function addTabImage(url,name){
		tabPanel.addTab({
			tabText:name,
			closable:true,
			dom:{
				tag:"img",
				title:"click to see detail",
				
				onclick:"window.open('"+url+"')",
				style:{
					width:"90%",
					height:"90%",
					cursor:"pointer"
				},
				src:url
			}
		});
	}
	
	
	
	 function copyToClipboard(txt) {       
	       textLinks.dom.value=txt;
	 }
       
});