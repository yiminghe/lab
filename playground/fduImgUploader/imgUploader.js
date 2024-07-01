/*
	v1.0 20091221 使用lite-ext,content script建立项目
	v1.1 20091222 监听窗口等比例调整图片大小，图片监听on("load"),缓存判断img.complete
	v1.2 20091223 使用 [Page action(控制地址栏图标)] [Background page(控制page action显示，监听page action点击,控制 content script)] [Message passing(沟通backgound page)],登陆时才显示
	v1.25 20091225 窗口最大化图片大小调整，非html标准属性用setAttribute
	chrome-extension 中 Ext.getDoc().dom == document 为false ..! 
	修正 Publish.java 发布打包工具编写
	v1.30 20091226 loading 动画图标加入，提供关闭预览设置，防止大图片拖慢浏览器
	v1.35 20090126 支持自动剪贴版，动画tip提示
*/
Ext.onReady(function () {
  var VERSION = '1.30';
  var DATE_VER = '20091226';
  var user = null;

  /*
  	no need,use pageAction*/
  var upload = Ext.DomHelper.append(
    Ext.getBody(),
    {
      tag: 'div',
      cls: 'uploadImgEnhancement',
      cn: [
        {
          tag: 'button',
          html: 'Upload Img',
        },
      ],
    },
    true,
  ).child('button');
  upload.on('click', openImagesWindow);

  if (typeof chrome != 'undefined') {
    if (document.cookie.indexOf('utmpuserid=') != -1)
      user = document.cookie.substring(
        document.cookie.indexOf('utmpuserid=') + 'utmpuserid='.length,
      );

    if (user)
      chrome.extension.sendRequest({
        msg: user,
      });

    chrome.extension.onRequest.addListener(
      function (request, sender, sendResponse) {
        openImagesWindow();
        sendResponse({});
      },
    );
    upload.parent('div').hide();
  }

  var mwindow;
  function openImagesWindow() {
    if (!mwindow) {
      initial();
    }
    if (mwindow.el.isVisible()) {
      mwindow.hide();
    } else
      mwindow.show({
        animateTarget: upload,
        constrainToView: true,
      });
  }

  function initial() {
    mwindow = new Ext.ux.WindowLite({
      width: 600,
      height: 500,
      modal: true,
      html:
        "<div id='tabpanel_test' class='tabpanel'>" +
        "	<div class='tabheader'>" +
        "<ul class='tabpanel_nav clearfix'>" +
        "<li class='tab_active'>" +
        "	<a class='tab_left' href='#' hideFocus='on'>" +
        "	<em class='tab_right'>" +
        "	<span class='tab_inner'>" +
        "	<span class='tab_text'>" +
        'tip' +
        '	</span>' +
        '</span>' +
        '	</em>' +
        '	</a>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        "<div class='panels'>" +
        "<div class='panel'>" +
        "<div style='height:100px;padding:10px;'>" +
        "<ol class='upTip'><li>added images will be shown at Tabs </li>" +
        ' <li>images can be uploaded simultaneously within browser limit</li> ' +
        "<li>image is proportional to it's original size </li>" +
        '<li>image urls will be copied to clipboard automatically </li>' +
        "<li>image will resize accordinly to window's size</li></ol>" +
        '	</div>' +
        '</div></div>',
      drag: true,
      title: 'Please select images',
      maximizable: true,
      tools: [
        {
          cls: 'x-tool tool-help',
          click: function (evt) {
            alert(
              ' Version : ' +
                VERSION +
                '\n Author:http://yiminghe.javaeye.com\n Date:' +
                DATE_VER +
                '',
            );
            evt.stopEvent();
          },
        },
      ],
      shadow: 'frame',
      //默认sides
      shadowOffset: 6,
      //默认4
      //设置默认焦点按钮
      defaultButton: 'close',
      //静态设置按钮
      buttons: [
        {
          text: 'close',
          handler: function (evt) {
            mwindow.hide();
            evt.stopEvent();
          },
        },
      ],
      //是否支持用户调节大小
      resizable: true,
    });

    var tip = Ext.DomHelper.insertFirst(
      mwindow.body.dom,
      {
        tag: 'div',
        cls: 'overTip',
        style: {
          visibility: 'hidden',
        },
        html: '已自动copy到剪贴版',
      },
      true,
    );

    var wrap = Ext.DomHelper.insertFirst(
      mwindow.body.dom,
      {
        tag: 'div',
        style: {
          padding: '10px',
        },
      },
      true,
    );
    var textLinks = Ext.DomHelper.append(
      wrap,
      {
        tag: 'p',
        style: {
          left: '-10000px',
          top: '-10000px',
          position: 'absolute',
        },
        cn: [
          {
            tag: 'textarea',
            title: 'you can use ctrl-a and ctrl-c to copy',
            rows: 5,
            style: {
              width: '95%',
              //,height:"30%"
            },
          },
        ],
      },
      true,
    ).child('textarea');

    function updateLinksToTextarea(tab) {
      //包括还没load完的，先把地址显示出来 : *= !
      var images = tabPanel.panelContainer.select('img[class*=realImg]');
      var text = [];
      images.each(function (el, this_, index_) {
        text.push(el.dom.src);
      });
      textLinks.dom.value = text.join('\n');
      //copy automatically
      textLinks.dom.select();
      document.execCommand('Copy');
      textLinks.dom.focus();

      tip.fadeIn({
        concurrent: false, //use queue
        duration: 1,
      });
      tip.fadeOut({
        concurrent: false, //use queue ,after fade in
        duration: 5,
        block: true, //other subsequent fade canceled
      });
    }

    /*预览控制*/
    var preview = Ext.DomHelper.append(
      wrap,
      {
        tag: 'p',
        cn: [
          {
            tag: 'button',
            title: '对大图片上传建议关闭预览',
            html: '关闭预览',
          },
        ],
      },
      true,
    ).child('button');
    preview.on('click', function () {
      preview.update(tabPanel.isDisplayed() ? '开启预览' : '关闭预览');
      tabPanel.toogle();
    });

    function addForm() {
      var form = Ext.DomHelper.insertBefore(
        preview,
        {
          tag: 'form',
          method: 'post',
          enctype: 'multipart/form-data',
          action: 'http://bbs.fudan.edu.cn/bbs/upload?b=PIC',
          cn: [
            {
              tag: 'input',
              type: 'file',
              name: 'up',
              size: 50,
            },
          ],
        },
        true,
      );
      var input = form.child('input');

      function clear() {
        Ext.destroy(input);
        Ext.destroy(form);
      }
      input.on('change', function () {
        form.mask('uploading...');
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
                  dom: [
                    {
                      tag: 'img',
                      title: 'click to see detail',
                      cls: 'replaceImg',
                      onclick: "window.open('" + m[1] + "')",
                      //first a loading image
                      src:
                        typeof chrome == 'undefined'
                          ? 'img-loading.gif'
                          : chrome.extension.getURL('img-loading.gif'),
                    },
                    {
                      tag: 'img',
                      onclick: "window.open('" + m[1] + "')",
                      title: 'click to see detail',
                      cls: 'loadingImg realImg',
                      src: m[1],
                    },
                  ],
                });
              } else alert(stripTags(response.responseText));
            } else {
              alert('error upload!');
            }
            form.unmask();
            clear();
          },
          failure: function () {
            var fileName = input.dom.value;
            var nameReg = /[^\/\\]+$/;
            var nameM = nameReg.exec(fileName);
            if (nameM && nameM[0]) alert('error : ' + nameM[0]);
            else alert('error');
            form.unmask();
            clear();
          },
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
      return !v ? v : String(v).replace(stripTagsRE, '');
    }

    /*预览tab区域*/
    var tabPanel = new Ext.ux.TabPanelLite({
      containerId: 'tabpanel_test',
    });
    tabPanel.on('add', updateLinksToTextarea);
    tabPanel.on('remove', updateLinksToTextarea);
    function resizeImg(img) {
      var w = 0;
      var h = 0;
      if (img.getAttribute('oriwidth')) {
        w = parseInt(img.getAttribute('oriwidth'));
        h = parseInt(img.getAttribute('oriheight'));
      } else {
        w = img.width;
        h = img.height;
        img.setAttribute('oriwidth', w + '');
        img.setAttribute('oriheight', h + '');
      }
      var avWidth = mwindow.body.getComputedWidth() - 20;
      //console.debug(img);
      //console.debug("avHeight: "+avHeight);
      //console.debug("avWidth: "+avWidth);
      //console.debug("w: "+w);
      //console.debug("h: "+h);
      if (w > avWidth) {
        var r = avWidth / w;
        var ah = h * r;
        Ext.fly(img).setWidth(avWidth);
        Ext.fly(img).setHeight(ah);
      } else {
        Ext.fly(img).setWidth(w);
        Ext.fly(img).setHeight(h);
      }
    }
    /*
        	图片加载后第一次
        */
    tabPanel.on('add', function (tab, panel) {
      var img = Ext.get(panel).child('img.replaceImg');
      //hidden real img load
      var realImg = Ext.get(panel).child('img.realImg', true);

      //cached ok,立即赋给loading img,resize
      function completeImg() {
        Ext.destroy(img);
        Ext.fly(realImg).removeClass('loadingImg');
        resizeImg(realImg);
      }

      if (realImg.complete) {
        completeImg();
      } else {
        Ext.fly(realImg).on('load', completeImg);
      }
    });

    /*任何界面调整，预览区域以及图片大小调整*/
    function adJustTab() {
      tabPanel.adjustScroll();
      //不包括loadingImg，只调整已经显示出来了 , =!
      var images = tabPanel.panelContainer.select("img[class=' realImg']");
      /*
            	窗体变化就变化图片大小
            */
      images.each(function (el, this_, index_) {
        resizeImg(el.dom);
      });
    }
    tabPanel.on('show', adJustTab);
    mwindow.on('maximize', adJustTab);
    mwindow.on('restore', adJustTab);
    mwindow.on('resize', adJustTab);
  }
});
