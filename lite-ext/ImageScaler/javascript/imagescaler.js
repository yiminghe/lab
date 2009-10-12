/*
	v1.5 稳定了，调整放大算法,剪裁区域和弹出窗口都是等比例拖放，根据放大窗口和剪裁区域的大小比设制放大窗口内最终放大图片的大小
*/
Ext.namespace('Ext.ux');
Ext.ux.ImageScaler = function(config) {
    config = config || {};
    if (!config.id) {
        alert("image id needed !");
    }

    Ext.apply(this, {
        initialConfig: config
    });
    Ext.apply(this, config);
    this.addEvents('hide', 'beforehide');
    Ext.ux.ImageScaler.superclass.constructor.call(this);
    this.image = Ext.get(this.id).dom;
    this.imageScalerWidth = Ext.get(this.image).getComputedWidth() * this.scaler;
    this.imageScalerHeight = Ext.get(this.image).getComputedHeight() * this.scaler;
    this.scalerViewerWidth = Ext.get(this.image).getComputedWidth() * this.viewScale;
    this.scalerViewerHeight = Ext.get(this.image).getComputedHeight() * this.viewScale;

    this.scalerViewer = Ext.DomHelper.append(document.body, {
        tag: 'div',
        cls: 'scalerViewer',
        style: 'width:' + this.scalerViewerWidth + 'px;height:' + this.scalerViewerHeight + 'px;display:none;',
        cn: [
        {
            tag: 'img',
            src: this.image.src,
            style: 'width:' + this.scalerViewerWidth + 'px;height:' + this.scalerViewerHeight + 'px;'
        }
        ]
    },
    true);
    this.scalerViewer.enableDisplayMode();
    this.scalerViewerImg = this.scalerViewer.child('img');

    this.imageScaler = Ext.DomHelper.append(document.body, {
        tag: 'div',
        cls: 'resizerScaler',
        style: 'width:' + this.imageScalerWidth + 'px;height:' + this.imageScalerHeight + 'px;display:none;',
        cn: [
        {
            tag: 'a',
            href: '#',
            cls: 'resizerHandle'
        },
        {
            tag: 'img',
            src: this.image.src,
            style: 'width:' + this.imageScalerWidth + 'px;height:' + this.imageScalerHeight + 'px;',
            cls: 'resizee'

        },
        {
            tag: 'div',
            cls: 'resizeeCover',
            style: 'width:' + this.imageScalerWidth + 'px;height:' + this.imageScalerHeight + 'px;'
        },
        {
            tag: 'div',
            cls: 'cropArea',
            style: 'width:' + this.imageScalerWidth + 'px;height:' + this.imageScalerHeight + 'px;',
            cn: [
            {
                tag: 'img',
                src: this.image.src,
                style: 'width:' + this.imageScalerWidth + 'px;height:' + this.imageScalerHeight + 'px;',
                cls: 'resizee'
            },
            {
                tag: 'div',
                cls: 'cropSizeDisplay',
                html: this.imageScalerWidth + 'x' + this.imageScalerHeight
            },
            {
                tag: 'a',
                href: '#',
                cls: 'cropResizeHandle'
            },
            {
                tag: 'a',
                href: '#',
                cls: 'saveHandle'
            },
            {
                tag: 'a',
                href: '#',
                cls: 'cancelHandle'
            }
            ]

        }
        ]
    },
    true);
    this.imageScaler.enableDisplayMode();
    this.resizerHandle = this.imageScaler.child('.resizerHandle');
    this.resizee = this.imageScaler.child('.resizee');
    this.cropSizeDisplay = this.imageScaler.child('.cropSizeDisplay');
    this.cropArea = this.imageScaler.child('.cropArea');
    this.resizeeClone = this.imageScaler.child('.cropArea .resizee');
    this.cropResizeHandle = this.imageScaler.child('.cropResizeHandle');
    this.resizeeCover = this.imageScaler.child('.resizeeCover');
    this.saveHandle = this.imageScaler.child('.saveHandle');
    this.cancelHandle = this.imageScaler.child('.cancelHandle');
    this.saveHandle.on('click',
    function(evt) {
        alert('尚未实现!');
        evt.stopEvent();

    });
    this.cancelHandle.on('click',
    function(evt) {
        this.hide();
        evt.stopEvent();

    },
    this);
    this.resizerHandle.on('mousedown', this.resizeMouseDown, this);
    this.cropResizeHandle.on('mousedown',
    function(evt) {
        this.resizeCropArea = true;
        evt.preventDefault();
    },
    this);
    this.cropArea.on('mousedown', this.cropMouseDown, this);
    this.imageScaler.select('a').on('click',
    function(evt) {
        evt.preventDefault();
    });

    if (!Ext.ux.ImageScaler.mask) {
        Ext.ux.ImageScaler.mask = Ext.getBody().createChild({
            cls: "ext-el-mask"
        },
        this.imageScaler.dom);
        Ext.ux.ImageScaler.mask.enableDisplayMode("block");
        Ext.ux.ImageScaler.mask.hide();
        Ext.ux.ImageScaler.mask.on('click',
        function(evt) {
            this.dom.focus();
            evt.stopEvent();
        });
    }
    this.hide();
    Ext.EventManager.onWindowResize(function() {
        if (!this.imageScaler.isVisible()) return;
        this.imageScaler.hide();
        this.show();
    },
    this);
};

Ext.extend(Ext.ux.ImageScaler, Ext.util.Observable, {

    cropMouseDown: function(evt) {
        this.pointerStart = evt.getXY();
        //拖放剪裁区域位置大小在拖放开始前记录下
        this.cropAreaStart = this.cropArea.getBox(false, true);
        // Include the resizee to limit the movement of the crop area
        var resizeeStart = this.resizee.getBox(false, true);
        this.maxX = resizeeStart.x + resizeeStart.width;
        this.maxY = resizeeStart.y + resizeeStart.height;
        Ext.getDoc().on('mousemove', this.cropMouseMove, this);
        Ext.getDoc().on('mouseup', this.cropMouseUp, this);
        // Stop the event flow
        evt.stopEvent();
    },

    cropMouseUp: function(evt) {
        // Remove all the events
        this.resizeCropArea = false;
        Ext.getDoc().un('mousemove', this.cropMouseMove, this);
        Ext.getDoc().un('mouseup', this.cropMouseUp, this);
        // Stop the event flow
        evt.stopEvent();
    },

    cropMouseMove: function(evt) {
        var pointer = evt.getXY();
        var width = this.cropAreaStart.width;
        var height = this.cropAreaStart.height;
        var left = this.cropAreaStart.x;
        var top = this.cropAreaStart.y;
        if (this.resizeCropArea) {
            // Resize the crop area
            width = (
            this.cropAreaStart.width
            + pointer[0]
            - this.pointerStart[0]
            );
            height = (
            this.cropAreaStart.height
            + pointer[1]
            - this.pointerStart[1]
            );
            // If the shift key is press, resize proportionally
            // calculation the percentage from original
            var widthPercent = (width / this.cropAreaStart.width);
            var heightPercent = (height / this.cropAreaStart.height);
            if (true || evt.shiftKey) {
                if (widthPercent > heightPercent) {
                    heightPercent = widthPercent;
                    height = Math.ceil(this.cropAreaStart.height
                    * heightPercent);
                } else {
                    widthPercent = heightPercent;
                    width = Math.ceil(this.cropAreaStart.width
                    * widthPercent);
                }
            }
            // Check if the new position would be out of bounds
            if (this.cropAreaStart.x + width > this.maxX) {
                width = this.maxX
                - this.cropAreaStart.x;
            } else if (width < 36) {
                width = 36;
            }
            if (this.cropAreaStart.y + height > this.maxY) {
                height = this.maxY
                - this.cropAreaStart.y;
            } else if (height < 36) {
                height = 36;
            }
            this.cropArea.setStyle({
                'width': width + 'px',
                'height': height + 'px'
            });
            this.cropSizeDisplay.update(width + 'x' + height);
        } else {
            // Move the crop area
            left = (
            this.cropAreaStart.x
            + pointer[0]
            - this.pointerStart[0]
            );
            top = (
            this.cropAreaStart.y
            + pointer[1]
            - this.pointerStart[1]
            );
            // Check if the new position would be out of
            // bounds and limit if necessary
            var maxLeft = this.maxX
            - this.cropAreaStart.width;
            if (left < 0) {
                left = 0;
            }
            else if (left > maxLeft) {
                left = maxLeft;
            }
            var maxTop = this.maxY
            - this.cropAreaStart.height;
            top < 0 && (top = 0);
            top > maxTop && (top = maxTop);

            this.cropArea.setStyle({
                'left': left + 'px',
                'top': top + 'px'
            });
            this.resizeeClone.setStyle({
                'left': (left * -1) + 'px',
                'top': (top * -1) + 'px'
            });
        }

        var widthP = this.scalerViewerWidth / width;
        var heightP = this.scalerViewerHeight / height;
        var finalP = Math.max(widthP, heightP);

        //等比例放大剪裁
        //this.scalerViewer.setSize(this.cropAreaStart.width * finalP, this.cropAreaStart.height * finalP);
        //对应剪裁图片，放大图片也放大为剪裁图片finalP
        this.scalerViewerImg.setSize(this.imageScaler.getComputedWidth() * finalP, this.imageScaler.getComputedHeight() * finalP);
        //根据剪裁公式，left 也扩展finalP倍
        //croparea left according to imagescaler size , scalerviewerimage size now is imagescaler size*finalP
        //so left is  croparea left*finalP
        this.scalerViewerImg.setStyle({
            'left': (left * -1 * finalP) + 'px',
            'top': (top * -1 * finalP) + 'px'
        });

        // Stop the event flow
        evt.stopEvent();
    },

    resizeMouseDown: function(evt) {
        this.pointerStart = evt.getXY();
        this.resizeeStart = this.resizee.getBox(false, true);
        this.cropAreaStart = this.cropArea.getBox(false, true);
        Ext.getDoc().on('mousemove', this.resizeMouseMove, this);
        Ext.getDoc().on('mouseup', this.resizeMouseUp, this);
        evt.stopEvent();
    },

    resizeMouseMove: function(evt) {
        // Retrieve the current pointer position
        var pointer = evt.getXY();

        // Calculate the new width and height for the image based on the pointer
        var width = (this.resizeeStart.width
        + pointer[0] - this.pointerStart[0]);
        var height = (this.resizeeStart.height
        + pointer[1] - this.pointerStart[1]);

        // Minimum size is 42 square
        width < 42 && (width = 42);
        height < 42 && (height = 42);

        // Calculation the percentage from original
        var widthPercent = (width / this.resizeeStart.width);
        var heightPercent = (height / this.resizeeStart.height);

        // If the shift key is press, resize proportionally
        //if(evt.shiftKey) {
        //强制等比例
        if (true) {
            if (widthPercent > heightPercent) {
                heightPercent = widthPercent;
                height = Math.ceil(this.resizeeStart.height * heightPercent);
            } else {
                widthPercent = heightPercent;
                width = Math.ceil(this.resizeeStart.width * widthPercent);
            }
        }

        // Calculation the new size for the crop area
        var cropWidth = Math.ceil(this.cropAreaStart.width * widthPercent);
        var cropHeight = Math.ceil(this.cropAreaStart.height * heightPercent);
        var cropLeft = Math.ceil(this.cropAreaStart.x * widthPercent);
        var cropTop = Math.ceil(this.cropAreaStart.y * heightPercent);

        // Resize the objects
        this.imageScaler.setStyle({
            'width': width + 'px',
            'height': height + 'px'
        });
        this.resizee.setStyle({
            'width': width + 'px',
            'height': height + 'px'
        });
        this.resizeeCover.setStyle({
            'width': width + 'px',
            'height': height + 'px'
        });
        this.cropArea.setStyle({
            'left': cropLeft + 'px',
            'top': cropTop + 'px',
            'width': cropWidth + 'px',
            'height': cropHeight + 'px'
        });
        this.resizeeClone.setStyle({
            'left': (cropLeft * -1) + 'px',
            'top': (cropTop * -1) + 'px',
            'width': width + 'px',
            'height': height + 'px'
        });

        this.cropSizeDisplay.update(width + 'x' + height);
        /*this.scalerViewer.setSize(width, height, {
            duration: 0.5
        });*/
        evt.stopEvent();
    },

    resizeMouseUp: function(evt) {
        Ext.getDoc().un('mousemove', this.resizeMouseMove, this);
        Ext.getDoc().un('mouseup', this.resizeMouseUp, this);
        evt.stopEvent();
    },
    /*
		*正中显示
		*/
    show: function() {
        //显示遮罩层，body内的select,等隐藏掉，防止遮罩层,大小设为屏幕大小.
        if (this.imageScaler.isVisible()) return;
        Ext.getBody().addClass("x-masked");
        Ext.ux.ImageScaler.mask.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
        Ext.ux.ImageScaler.mask.show();

        this.imageScaler.setStyle({
            top: Ext.getBody().getScroll().top + 'px'
        });
        this.scalerViewer.setStyle({
            top: Math.max(0, (Ext.getBody().getScroll().top + Ext.lib.Dom.getViewportHeight() - this.scalerViewer.getComputedHeight())) + 'px'
        });

        this.imageScaler.show();
        this.scalerViewer.show();
    },


    hide: function() {
        if (this.fireEvent("beforehide", this) !== false) {

            //防止占用页面空间 2009-05-12
            this.imageScaler.hide();
            this.scalerViewer.hide();
            //隐藏遮罩层			
            Ext.ux.ImageScaler.mask.hide();
            Ext.getBody().removeClass("x-masked");
            this.fireEvent("hide", this);
        }
    }

});