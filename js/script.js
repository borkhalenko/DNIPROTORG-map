var arr_routes_list_json;
$(document).ready(function () {
    // Info Box Callbacks

    function ibCallbacks() {
        $(".tweets").each(function () {
            var username = $(this).attr("title");
            $(this).empty().tweet({ username: username, count: 3, loading_text: "loading tweets...", template: "{text}  {time}" });
        });
        $(".iw-body").myTabs({ hidewhat: ".iw-body-main", controller: ".iw-body-tabs a" });
    }

    /* Map Starts */
    function initialize() {
        var g = google.maps;
        var myLatLng = new g.LatLng(50.45, 30.45);
        var myOptions = {
            zoom: 11,
            center: myLatLng,
            mapTypeId: g.MapTypeId.ROADMAP,
            mapTypeControl: false,
            navigationControlOptions: {
                position: g.ControlPosition.RIGHT_CENTER,
                style: google.maps.NavigationControlStyle.SMALL
            }
        }
        var map = new g.Map($("#map_canvas")[0], myOptions);
        var image = 'img/marker.png';
        var shadow = 'img/shadow.png';
        var iconmark = new g.MarkerImage(image, new g.Size(32, 40));
        var shadowmark = new g.MarkerImage(shadow, new g.Size(29, 25), new g.Point(0, 0), new g.Point(5, 25));

        createShopList();

        $.getJSON('pecel.json', function (data) {
            var newMarkers = [], marker, clatlng = [];
            for (var i = 0; i < arr_routes_list_json.length; i++) {
                if (arr_routes_list_json[i].coords != null && arr_routes_list_json[i].coords) {
                    var strlatlng = arr_routes_list_json[i].coords,
                    fId = arr_routes_list_json[i].tt_number,
                    fName = arr_routes_list_json[i].contractor_name,
                    fWeb = "web",
                    fOpenStat = "openstat",
                    fEmail = "email",
                    fOpenToday = "8:00-18:00",
                    fPhone = "098-111-22-33",
                    fTwitter = "",
                    fAdr = arr_routes_list_json[i].contractor_address,
                    //fAvaPath = (data[i].fAvaPath == '') ? '' : '<img src="img/uploads/' + data[i].fAvaPath + '" />',
                    fImgPath = '<img src="img/uploads/pict1.png" />';

                    if (strlatlng.indexOf(',') > 0) {
                        var arrlatlng = strlatlng.split(',');
                        var latlng = new g.LatLng(parseFloat(arrlatlng[1]), parseFloat(arrlatlng[0]));
                        marker = new g.Marker({ map: map, position: latlng, icon: iconmark, shadow: shadowmark, clickable: true });
                        newMarkers[i] = marker;
                        // newMarkers.push(marker);
                        clatlng.push(latlng);

                        /** Infobox **/
                        var boxText = document.createElement("div");
                        //var boxContent = '<div class="iw-wrap"> <div class="iw-content"> <div class="iw-head clearfix"> <div class="ftd-org"> <a href="#" class="ftd-ftimg">' + fAvaPath + '</a> <div class="ftd-data vcard"> <p class="org">' + fName + '</p> <p class="adr"><span class="street-address">' + fAdr + '</span></p> <div class="ftd-tools"> <ul class="clearfix"> <li><a href="' + fWeb + '"><i class="i-web"></i>Visit Website</a></li><li><a href="#" class="keep-centered" data-index="' + i + '"><i class="i-centered"></i>Keep Centered</a></li> </ul> </div> </div> </div> </div> <div class="iw-body"> <div class="iw-body-tabs"> <ul class="clearfix"> <li><a href="#ftd-info">Info Warung</a></li> <li><a href="#ftd-tweets" class="last-of-type">Tweet Terbaru</a></li> </ul> </div> <div class="iw-body-wrap"> <div class="iw-body-main" id="ftd-info"> <div class="iw-box clearfix"> <div class="iw-grid2 iw-ftimg">' + fImgPath + '</div> <div class="iw-grid1"> <p><strong>E-Mail</strong></p> <p><a href="mailto:' + fEmail + '">' + fEmail + '</a></p> <br /> <p><strong>Buka Hari Ini Jam</strong></p> <p>' + fOpenToday + '</p> <br /> <p><strong>Nomor Telepon</strong></p> <p>' + fPhone + '</p> </div> </div> </div> <div class="iw-body-main" id="ftd-tweets"> <div class="iw-box clearfix"> <div class="iw-grid3"> <div class="tweets" title="' + fTwitter + '"></div> </div> </div> </div> </div> </div> </div> </div>';
                        var boxContent = '<div class="iw-wrap"> <div class="iw-content"> <div class="iw-head clearfix"> <div class="ftd-org">  <div class="ftd-data vcard"> <p class="org">' + fName + '</p> <p class="adr"><span class="street-address">' + fAdr + '</span></p> <div class="ftd-tools"> <ul class="clearfix"> <li><a href="' + fWeb + '"><i class="i-web"></i>Фото</a></li><li><a href="#" class="keep-centered" data-index="' + i + '"><i class="i-centered"></i>Центр карти</a></li> </ul> </div> </div> </div> </div> <div class="iw-body"> <div class="iw-body-tabs"> <ul class="clearfix"> <li><a href="#ftd-info">Інфо</a></li> <li><a href="#ftd-tweets" class="last-of-type">Відгуки</a></li> </ul> </div> <div class="iw-body-wrap"> <div class="iw-body-main" id="ftd-info"> <div class="iw-box clearfix"> <div class="iw-grid2 iw-ftimg">' + fImgPath + '</div> <div class="iw-grid1"> <br /> <p><strong>Графік роботи</strong></p> <p>' + fOpenToday + '</p> <br /> <p><strong>Телефон</strong></p> <p>' + fPhone + '</p> </div> </div> </div> <div class="iw-body-main" id="ftd-tweets"> <div class="iw-box clearfix"> <div class="iw-grid3"> </div> </div> </div> </div> </div> </div> </div>';
                        boxText.innerHTML = boxContent;
                        var ibOptions = {
                            content: boxText
                            , disableAutoPan: false
                            , maxWidth: 0
                            , pixelOffset: new g.Size(25, -90)
                            , zIndex: 99
                            , closeBoxURL: "img/close.png"
                            , infoBoxClearance: new g.Size(1, 1)
                            , isHidden: false
                            , pane: "floatPane"
                            , enableEventPropagation: false
                        };

                        newMarkers[i].infobox = new InfoBox(ibOptions);

                        g.event.addListener(marker, 'click', (function (marker, i) {
                            return function () {
                                for (h = 0; h < newMarkers.length; h++) {
                                    if (newMarkers[h] != null) {
                                        newMarkers[h].infobox.close();
                                    }
                                }
                                newMarkers[i].infobox.open(map, this);
                            }
                        })(marker, i));

                        g.event.addListener(newMarkers[i].infobox, 'domready', function () {
                            ibCallbacks();

                            //Keep Centered
                            $(".keep-centered").click(function (e) {
                                e.preventDefault();
                                map.setCenter(clatlng[$(this).attr("data-index")]);
                            });
                        });
                    }
                }
            }

            var markerCluster = new MarkerClusterer(map, newMarkers);

            $(".ft-name a").click(function (e) {
                e.preventDefault();
                var index = $(".ft-name").index($(this).parent());
                g.event.trigger(newMarkers[index], 'click');
            });
        });

        var trafficLayer = new g.TrafficLayer();

        $("#map-view").click(function () { map.setMapTypeId(g.MapTypeId.ROADMAP); return false });
        $("#sat-view").click(function () { map.setMapTypeId(g.MapTypeId.SATELLITE); return false });

        var tog = false;
        $("#toggle-traffic").click(function () {
            var icon = $("i", this), text = $("span", this);
            trafficLayer.setMap(!tog == true ? map : null);
            text.text(!tog == true ? "Приховати затори" : "Показати затори");
            icon.toggleClass("i-showtr i-hidetr");
            tog = !tog;
            return false;
        });
    }

    initialize();
    loadFile();
    ibCallbacks();

    // Map Panel
    $(".mp-toggle").click(function (e) {
        e.preventDefault();
        var obj = $(this), el = $(this).parent();
        if (el.hasClass("visible")) {
            el.animate({ "left": "-380px" }).removeClass("visible");
            obj.find("i").toggleClass("arr-open arr-close");
        }
        else {
            el.animate({ "left": "0" }).addClass("visible"); ;
            obj.find("i").toggleClass("arr-open arr-close");
        }
    });

    $("#foodmap-ft-list").jScrollPane();
});

function createShopList() {
    $.ajax({ type: 'POST', async: false, url: 'php/getShopList.php', success: requestProcessing });
    function requestProcessing(result) {
        arr_routes_list_json = JSON.parse(result);
        for (var i = 0; i < arr_routes_list_json.length; i++) {
            var shop_list_element = '<li> <p class="ft-name"> <a href="#">'+arr_routes_list_json[i].contractor_name+'</a> <span class="ft-adr">'+arr_routes_list_json[i].contractor_address+'</span> </p><span class="ft-status"><i class="msmall-on"></i></span>';
            $( shop_list_element ).appendTo( ".ft-list" );
        }
    }
}

function loadFile() {
    var btnUpload = $('#upload-file');
    var status = $('#status');
    new AjaxUpload(btnUpload, {
        action: './php/upload-file.php',
        //Имя файлового поля ввода
        name: 'uploadfile',
        onSubmit: function (file, ext) {
            if (!(ext && /^(xls|txt)$/.test(ext))) {
            // Валидация расширений файлов
                alert("Только XLS файлы");
                return false;
            }
            status.text('Загрузка...');
        },
        onComplete: function (file, response) {
            //Очищаем текст статуса
            status.text('');
            //Добавляем загруженные файлы в лист
            if (response === "success") {
                alert("Файл " + file + " успешно загружен");
            }
            else {
                alert("Херня:"+response);
            }
        } 
    });
}
