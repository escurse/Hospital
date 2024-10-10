const $loading = document.body.querySelector(':scope > .loading');

const showLoading = () => $loading.classList.add('--visible');
const hideLoading = () => $loading.classList.remove('--visible');

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
    var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
        return node.nodeType === 3;
    });
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
        obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
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

const $filter = document.getElementById('filter');
const $filterList = $filter.querySelector(':scope > .list');

const hospitalCategoryMap = {
    '01': '상급종합병원',
    '11': '종합병원',
    '21': '병원',
    '28': '요양병원',
    '29': '정신병원',
    '31': '의원',
    '41': '치과병원',
    '51': '치과의원',
    '61': '조산원',
    '71': '보건소',
    '72': '보건지소',
    '73': '보건진료소',
    '74': '모자보건센터',
    '75': '보건의료원',
    '81': '약국',
    '91': '한방종합병원',
    '92': '한방병원',
    '93': '한의원',
    '94': '한약방',
    'AA': '병의원'
};
const hospitals = [];

const loadData = () => {
    hospitals.splice(0, hospitals.length);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        hideLoading();
        if (xhr.status < 200 || xhr.status >= 300) {
            return;
        }
        const response = xmlToJson(xhr.responseText);
        for (const hospitalObject of response['response']['body']['items']['item']) {
            hospitals.push({
                name: hospitalObject['yadmNm'],                 // 병원 이름
                categoryCode: hospitalObject['clCd'],           // 병원 구분 코드
                latitude: hospitalObject['XPos'],               // 위도
                longitude: hospitalObject['YPos'],              // 경도
                address: hospitalObject['addr'],                // 주소
                addressPostal: hospitalObject['postNo'],        // 우편번호
                contact: hospitalObject['telno'],               // 전화번호
                homepage: hospitalObject['hospUrl'],            // 홈페이지 주소
                totalDoctorsCount: hospitalObject['drTotCnt'],  // 전체 의사 수
            })
        }
        $filterList.innerHTML = '';
        for (const hospital of hospitals) {
            const $name = document.createElement('span');
            $name.classList.add('name');
            $name.innerText = hospital['name'];
            const $category = document.createElement('span');
            $category.classList.add('category');
            $category.innerText = hospitalCategoryMap[hospital['categoryCode']];
            const $nameWrapper = document.createElement('span');
            $nameWrapper.classList.add('name-wrapper');
            $nameWrapper.append($name, $category);

            const $address = document.createElement('span');
            $address.classList.add('address');
            $address.innerText = hospital['address'];

            const $contact = document.createElement('a');
            $contact.classList.add('contact');
            $contact.href = hospital['contact'];
            $contact.innerHTML = `<i class="fa-solid fa-phone"></i>${hospital['contact']}`;

            const $homepage = document.createElement('a');
            $homepage.classList.add('homepage');
            $homepage.href = `tel:${hospital['contact']}`;
            $homepage.target = '_blank';
            $homepage.innerHTML = `<i class="fa-solid fa-globe"></i>${hospital['homepage']}`;

            const $item = document.createElement('li');
            $item.classList.add('item');
            $item.append($nameWrapper, $address, $contact, $homepage);
            $filterList.append($item);

            if (hospital['homepage'] === undefined) {
                $homepage.innerHTML = '';
            }

            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(hospital['longitude'], hospital['latitude'])
            });

            marker.setMap(map);
        }
    };
    // xhr.open('GET', 'http://192.168.4.252:8080/B551182/hospInfoServicev2/getHospBasisList?serviceKey=ubb%2BOlxX6eAciwn9CaiIjTmsvyt9xeGbp85%2FLfcs2R8QhQMQjQ6uFIXGbgrx60fI4VmYtKoj5UkMGbIsBkaeew%3D%3D&sidoCd=230000');

    // 가정용
    xhr.open('GET', 'http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?serviceKey=ubb%2BOlxX6eAciwn9CaiIjTmsvyt9xeGbp85%2FLfcs2R8QhQMQjQ6uFIXGbgrx60fI4VmYtKoj5UkMGbIsBkaeew%3D%3D&sidoCd=230000&numOfRows=1000');
    xhr.send();
    showLoading();
};

loadData();


// var mapContainer = document.getElementById('map'), // 지도를 표시할 div
//     mapOption = {
//         center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
//         level: 3 // 지도의 확대 레벨
//     };
//
// var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
//
// // 마커가 표시될 위치입니다
// var markerPosition  = new kakao.maps.LatLng(33.450701, 126.570667);
//
// // 마커를 생성합니다
// var marker = new kakao.maps.Marker({
//     position: markerPosition
// });
//
// // 마커가 지도 위에 표시되도록 설정합니다
// marker.setMap(map);
//
// // 아래 코드는 지도 위의 마커를 제거하는 코드입니다
// // marker.setMap(null);
