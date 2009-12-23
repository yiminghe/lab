/*
	v1.0 20091221 使用lite-ext,content script建立项目
	v1.1 20091222 监听窗口调整图片大小，图片监听on("load"),缓存判断img.complete
	v1.2 20091223 使用 [Page action(控制地址栏图标)] [Background page(控制page action显示，监听page action点击,控制 content script)] [Message passing(沟通backgound page)],登陆时才显示
*/
Ext.onReady(function () {
		var VERSION="1.20";
		var DATE="20091223";
		var user=null;
		if(typeof chrome !="undefined") {
			if(document.cookie.indexOf("utmpuserid=")!=-1)
			user=document.cookie.substring(document.cookie.indexOf("utmpuserid=")+"utmpuserid=".length);
			
			if(user)chrome.extension.sendRequest({msg: user});
			
	    chrome.extension.onRequest.addListener(
	    function(request, sender,sendResponse) {
	    		
	        openImagesWindow();
	        sendResponse({});
	    });
  	}
    
    
    var mwindow;
    function openImagesWindow() {
        if (!mwindow) {
            initial();
        }
        if(mwindow.el.isVisible()){
        	mwindow.hide();
        }
        else mwindow.show({
            animateTarget: upload,
            constrainToView: true
        });
    };
    /*
    no need,use pageAction*/
    var upload = Ext.DomHelper.append(Ext.getBody(), {
        tag: "div",
        cls: "uploadImgEnhancement",
        cn: [{
            tag: "button",
            html: "Upload Img"
        }]
    },
    true).child("button");
    upload.on("click", openImagesWindow);
		
		
    function initial() {
        mwindow = new Ext.ux.WindowLite({
            width: 600,
            height: 500,
            modal: true,
            html: "<div id='tabpanel_test' class='tabpanel'>" + "	<div class='tabheader'>" + "<ul class='tabpanel_nav clearfix'>" + "<li class='tab_active'>" + "	<a class='tab_left' href='#' hideFocus='on'>" + "	<em class='tab_right'>" + "	<span class='tab_inner'>" + "	<span class='tab_text'>" + "tip" + "	</span>" + "</span>" + "	</em>" + "	</a>" + "</li>" + "</ul>" + "</div>" + "<div class='panels'>" + "<div class='panel'>" + "<div style='height:100px;'>" + "added images will be shown at Tabs <br/> images can be uploaded simultaneously within browser limit<br/> "
            +"image is proportional to it's original size <br/> image will resize accordinly to window's size" + 
            "	</div>" + "</div></div>",
            drag: true,
            title: 'Please select images',
            maximizable: true,
            tools: [{
                cls: 'x-tool tool-help',
                'click': function (evt) {
                    alert(" Version : "+VERSION+";\n Author:yiminghe.javaeye.com;\n Date:"+Date+"");
                    evt.stopEvent();
                }
            }],
            shadow: 'frame',
            //默认sides
            shadowOffset: 6,
            //默认4
            //设置默认焦点按钮
            defaultButton: 'close',
            //静态设置按钮       
            buttons: [{
                text: 'close',
                handler: function (evt) {
                    mwindow.hide();
                    evt.stopEvent();
                }
            }],
            //是否支持用户调节大小      	
            resizable: true
        });
        var wrap = Ext.DomHelper.insertFirst(mwindow.body.dom, {
            tag: "div",
            style: {
                padding: "10px"
            }
        },
        true);
        var textLinks = Ext.DomHelper.append(wrap, {
            tag: "p",
            cn: [{
                tag: "textarea",
                title: "you can use ctrl-a and ctrl-c to copy",
                rows: 5,
                style: {
                    width: "95%"
                    //,height:"30%"
                }
            }]
        },
        true).child("textarea");

        function updateLinksToTextarea(tab) {
            var images = tabPanel.panelContainer.select("img");
            var text = [];
            images.each(function (el, this_, index_) {
                text.push(el.dom.src);
            });
            textLinks.dom.value = text.join("\n");
        }
        function addForm() {
            var form = Ext.DomHelper.append(wrap, {
                tag: "form",
                method: "post",
                enctype: "multipart/form-data",
                action: "http://bbs.fudan.edu.cn/bbs/upload?b=PIC",
                cn: [{
                    tag: "input",
                    type: "file",
                    name: "up",
                    size: 50
                }]
            },
            true);
            var input = form.child("input");

            function clear() {
                Ext.destroy(input);
                Ext.destroy(form);
            }
            input.on("change", function () {
                form.mask("uploading...");
                addForm();
                Ext.Ajax.request({
                    form: form,
                    success: function (response) {
                        //response.responseText = "we <strong id=\"url\">http://bbs.fudan.edu.cn/upload/PIC/1261411452-6838.jpg</strong> zzz";
                        if (response.responseText) {
                            var result = response.responseText;
                            var fileName = input.dom.value;
                            var nameReg = /[^\/\\]+$/;
                            var nameM = nameReg.exec(fileName);
                            var reg = /<strong id="url">([^<]+)<\/strong>/;
                            var m = reg.exec(result);
                            if (m && m[1] && nameM && nameM[0]) {
                                tabPanel.addTab({
                                    tabText: nameM[0],
                                    closable: true,
                                    dom: {
                                        tag: "img",
                                        title: "click to see detail",
                                        onclick: "window.open('" + m[1] + "')",
                                        //onload:"Ext.ux.resizeImg(this);",
                                        style: {
                                            //width: "90%",
                                            //height: "60%",
                                            cursor: "pointer"
                                        },
                                        src: m[1]
                                    }
                                });
                            } else alert(stripTags(response.responseText));
                        }
                        form.unmask();
                        clear();
                    },
                    failure: function () {
                        var fileName = input.dom.value;
                        var nameReg = /[^\/\\]+$/;
                        var nameM = nameReg.exec(fileName);
                        if (nameM && nameM[0]) alert("error : " + nameM[0]);
                        else alert("error");
                        form.unmask();
                        clear();
                    }
                });
            });
        }
        addForm();
        var stripTagsRE = /<\/?[^>]+>/gi;
        /**
         * Strips all HTML tags
         * @param {Mixed} value The text from which to strip tags
         * @return {String} The stripped text
         */

        function stripTags(v) {
            return !v ? v : String(v).replace(stripTagsRE, "");
        }
        var tabPanel = new Ext.ux.TabPanelLite({
            containerId: 'tabpanel_test'
        });
        tabPanel.on("add", updateLinksToTextarea);
        tabPanel.on("remove", updateLinksToTextarea);
        function resizeImg(img, resize) {
            var w = img.width;
            var h = img.height;
            if (resize) {
                w = img.oriwidth;
                h = img.oriheight;
            } else {
                img.oriwidth = w;
                img.oriheight = h;
            }
            var avHeight = mwindow.body.getComputedHeight() - wrap.getComputedHeight();
            var avWidth = mwindow.body.getComputedWidth();
            if (avWidth >= w && avHeight >= h) {
                return;
            } else if (w > avWidth) {
                if (avHeight < h) {
                    avWidth -= 20;
                }
                var r = avWidth / w;
                var ah = h * r;
                Ext.fly(img).setWidth(avWidth);
                Ext.fly(img).setHeight(ah);
            }
        };
        /*
        	图片加载后第一次自动缩放
        */
        tabPanel.on("add", function (tab, panel) {
            var img = Ext.get(panel).child("img", true);
            if (img.complete) {
                resizeImg(img);
            } else {
                Ext.fly(img).on("load", function () {
                    resizeImg(img);
                    Ext.fly(img).removeAllListeners();
                });
            }
        });

        function adJustTab() {
            tabPanel.adjustScroll();
            var images = tabPanel.panelContainer.select("img");
            /*
            	窗体变化就变化图片大小
            */
            images.each(function (el, this_, index_) {
                resizeImg(el.dom, true);
            });
        }
        mwindow.on("maximize", adJustTab);
        mwindow.on("restore", adJustTab);
        mwindow.on("resize", adJustTab);
    }
});