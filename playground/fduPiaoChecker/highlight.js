$(function () {
		//when page starts ,then ask for cities to highlight records
    chrome.extension.sendRequest({
        msg: "get"
    },
    function (response) {
        if (!response.cities) return;
        var cities = "(" + response.cities.join("|") + ")";
        var citiesReg = new RegExp(cities, "g");
        var testReg = new RegExp(cities);
        $("a.ptitle").each(function (index, el) {
            el = $(el);
            var html = el.html();
            //no chinese please,use unicode
            if (testReg.test(html) && html.indexOf("\u6c42") == -1) {
                el.html(highlight(html, citiesReg));
            }
        });
    });
    function highlight(title, citiesReg) {
        return title.replace(citiesReg, "<span style=\"font-weight:bold;color:blue;\">$1</span>")
    }
});