function xmlToJson(xml) {
    if (typeof xml === 'string') {
        xml = (new DOMParser()).parseFromString(xml, 'text/xml');
    }
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) {
        // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) {
        // text
        obj = xml.nodeValue;
    }

    // do children
    // If all text nodes inside, get concatenated text from them.
    var textNodes = [].slice.call(xml.childNodes).filter(function(node) {
        return node.nodeType === 3;
    });
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
        obj = [].slice.call(xml.childNodes).reduce(function(text, node) {
            return text + node.nodeValue;
        }, "");
    } else if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof obj[nodeName] == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

const $map = document.getElementById('map');

const map = new kakao.maps.Map($map, {
    center: new kakao.maps.LatLng(35.8715411, 128.601505),
    level: 3
});

const hospitals = [];

const loadData = () => {
    hospitals.splice(0, hospitals.length);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.status !== XMLHttpRequest.DONE) {
            return;
        }
    };
    xhr.open('GET', 'http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?serviceKey=ubb%2BOlxX6eAciwn9CaiIjTmsvyt9xeGbp85%2FLfcs2R8QhQMQjQ6uFIXGbgrx60fI4VmYtKoj5UkMGbIsBkaeew%3D%3D&sidoCd=230000');
    xhr.send();
};










