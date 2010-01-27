/*
v1.16(20100122) 支持选项设置，
								支持content script高亮显示，
								支持数字browser action badgetext,
								支持摘要browser action title
v1.2(20100127) 抛弃正则表达式，采用 jquery 来遍历 xml
*/
var animationFrames = 36;
var animationSpeed = 10;
// ms
var canvas;
var canvasContext;
var piaoImage;
var pollIntervalMin = 1000 * 8;
// 10 seconds
var pollIntervalMax = 1000 * 60;
// 1 minute
var requestFailureCount = 0;
// used for exponential backoff
var requestTimeout = 1000 * 5;
// 5 seconds
var rotation = 0;
var unreadCount = -1;
var loadingAnimation = new LoadingAnimation();
var lastId = 0;

function getSavedCity() {
    var cities = localStorage.cities || "火星,地球";
    cities = cities.split(/,|，/);
    return $.map(cities, function (c) {
        c = $.trim(c);
        return c ? c : null;
    });
}
function setLastId(id) {
    localStorage.lastId = id + "";
}
function isQulifiedId(id) {
    return (parseInt(localStorage.lastId) || 0) < id;
}
function isRelated(title) {
    if (title.indexOf("求") != -1) return false;
    var cities = getSavedCity();
    cities = "(" + cities.join("|") + ")";
    var citiesReg = new RegExp(cities);
    return citiesReg.test(title);
}
function getPiaoUrl() {
    var url = "http://bbs.fudan.edu.cn/bbs/tdoc?bid=288";
    return url;
}
function isPiaoUrl(url) {
    return url == getPiaoUrl();
}
function LoadingAnimation() {
    this.timerId_ = 0;
    this.maxCount_ = 8;
    // Total number of states in animation
    this.current_ = 0;
    // Current state
    this.maxDot_ = 4;
    // Max number of dots in animation
}
LoadingAnimation.prototype.paintFrame = function () {
    var text = "";
    for (var i = 0; i < this.maxDot_; i++) {
        text += (i == this.current_) ? "." : " ";
    }
    if (this.current_ >= this.maxDot_) text += "";
    chrome.browserAction.setBadgeText({
        text: text
    });
    this.current_++;
    if (this.current_ == this.maxCount_) this.current_ = 0;
    //console.log(text);
}
LoadingAnimation.prototype.start = function () {
    if (this.timerId_) return;
    var self = this;
    this.timerId_ = window.setInterval(function () {
        self.paintFrame();
    },
    100);
}
LoadingAnimation.prototype.stop = function () {
    if (!this.timerId_) return;
    window.clearInterval(this.timerId_);
    this.timerId_ = 0;
}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.url && isPiaoUrl(changeInfo.url)) {
        getRelatedCount(function (rspXml) {
            updateUnreadCount(rspXml);
        });
    }
});
function init() {
    canvas = document.getElementById('canvas');
    piaoImage = document.getElementById('piao_img');
    canvasContext = canvas.getContext('2d');
    chrome.browserAction.setBadgeBackgroundColor({
        color: [208, 0, 24, 255]
    });
    loadingAnimation.start();
    startRequest();
}
function scheduleRequest() {
    var randomness = Math.max(1,Math.random() * 2);
    var exponent = Math.pow(2, requestFailureCount);
    var delay = Math.min(randomness * pollIntervalMin * exponent, pollIntervalMax);
    delay = Math.round(delay);
    window.setTimeout(startRequest, delay);
}
// ajax stuff
function startRequest() {
		console.log("request @datetime: " + new Date() );
    getRelatedCount(
    function (count) {
        loadingAnimation.stop();
        updateUnreadCount(count);
        scheduleRequest();
    },
    function () {
        loadingAnimation.stop();
        scheduleRequest();
    });
}
function getRelatedCount(onSuccess, onError) {
    $.ajax({
        url: getPiaoUrl(),
        type: "get",
        cache: false,
        timeout: requestTimeout,
        error: function (xhr, status) {
            ++requestFailureCount;
            onError && onError();
        },
        success: function (data, status) {
            requestFailureCount = 0;
            onSuccess && onSuccess(data);
        }
    });
}
//精通正则表达式 p200
//<po x=">" >合法</po>
//now use xml api,not pure text api
var piaoReg = /<po(?:id='(\d+)'|"[^"]*"|'[^']*'|[^'">])*>(.+?)<\/po>/g;
function getRelateTicketsInfo(rspXml) {
    var count = 0;
    var rels = [];
    var pos = $(rspXml).find("po");
    pos.each(function (index, po) {
        po = $(po);
        var id = po.attr("id");
        if (!isQulifiedId(id)) {
            return;
        }
        var text = po.text();
        if (isRelated(text)) {
            count++;
            rels.push(text);
            lastId = id;
        }
    });
    return {
        count: count,
        rels: rels
    };
}
function updateUnreadCount(rspXml) {
    var relInfo = getRelateTicketsInfo(rspXml);
    var count = relInfo.count;
    if (count == 0) relInfo.rels = ["checking ..."];
    chrome.browserAction.setTitle({
        title: relInfo.rels.join("\n")
    });
    
    if (unreadCount != count) {
        unreadCount = count;
        animateFlip();
    }
}
function ease(x) {
    return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
}
function animateFlip() {
    rotation += 1 / animationFrames;
    drawIconAtRotation();
    if (rotation <= 1) {
        setTimeout("animateFlip()", animationSpeed);
    } else {
        rotation = 0;
        drawIconAtRotation();
        chrome.browserAction.setBadgeText({
            text: unreadCount != "0" ? unreadCount + "" : ""
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: [208, 0, 24, 255]
        });
        if ("1" == localStorage.alertW && unreadCount != "0") {
            alert("有" + unreadCount + "条新车票信息，可以点击图标查看！");
        }
    }
}
function drawIconAtRotation() {
    canvasContext.save();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.translate(
    Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
    canvasContext.rotate(2 * Math.PI * ease(rotation));
    canvasContext.drawImage(piaoImage, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
    canvasContext.restore();
    chrome.browserAction.setIcon({
        imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
    });
}

//转到票务tab或者新建票务tab
function goToPiaos(callback) {
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url && isPiaoUrl(tab.url)) {
                chrome.tabs.update(tab.id, {
                    selected: true,
                    url: getPiaoUrl()
                });
                callback(tab.id);
                return;
            }
        }
        chrome.tabs.create({
            url: getPiaoUrl()
        },
        function (tab) {
            callback(tab.id);
        });
    });
}
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
    goToPiaos(piaoTabViewUpdate);
});

//当重新选择票务tab则刷新页面，更新到最新
chrome.tabs.onSelectionChanged.addListener(function (tabId, selectInfo) {
    chrome.tabs.get(tabId, function (tabInfo) {
        if (tabInfo.url && isPiaoUrl(tabInfo.url)) {
            goToPiaos(piaoTabViewUpdate);
        }
    });
});

//记录最后帖子id
function piaoTabViewUpdate(tabId) {
    setLastId(lastId);
    updateUnreadCount(0);
}

//页面请求关注城市名字？
chrome.extension.onRequest.addListener(
function (request, sender, sendResponse) {
    if (request.msg && request.msg == "get") sendResponse({
        cities: getSavedCity()
    });
});