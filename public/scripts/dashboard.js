$( document ).ready(function() {
    // Start clock

    var interval = setInterval(function() {
        var momentNow = moment();
        $('.clock > .widget_content').html(
            "<span>" +
                momentNow.format('h:mm A') +
                "<br>" +
                momentNow.format('dddd').substring(0,3).toUpperCase() + ' ' +
                momentNow.format('MMMM DD, YYYY ') +
            "</span>"
        );
    }, 1000);

    var interval = setInterval(function() {
        var sourcesUrl = "https://newsapi.org/v1/sources?language=en";
        var articlesUrl = "https://newsapi.org/v1/articles?source=";

        $.getJSON(sourcesUrl).then(function(sources) {
            console.log(sources);
            if(sources.status == 'ok') {
                console.log(sources.sources.length);
                var articleSource = sources.sources[Math.floor(Math.random() * (sources.sources.length+1))];
                console.log(articleSource);
                $.getJSON(articlesUrl + articleSource.id + "&sortBy=" + articleSource.sortBysAvailable[0] + "&apiKey=e636cc3f53c64bfc878a77058e8e2a80").then(function(articles) {
                    console.log(articles);
                    $('.news > .widget_content').html(
                        "<span><h1>"+articles.articles[0].title+"</h1><BR />"+articles.articles[0].description+"</span>"
                    );
                    // UpdateChromecast();
                });
            } else {
                $('.news > .widget_content').html(
                    "<span>" + "Could not connect to News API" + "</span>"
                );
            }
        });
    }, 10000);







    $(".dashboard").height($(window).height());

    var hack = ["31946589405_deb63e02d6_o.jpg", "32260740536_2866cf4065_o.jpg", "bli_grc.jpg", "peggyw_spacewalk.jpg",
        "pia13078.jpg", "pia14454.jpg", "pia20516-1041.jpg", "pia21056-1041.jpg", "pia21263.jpg", "pia21376d.jpg"];

    // $.fn.preload = function() {
    //     this.each(function(){
    //         $('<img/>')[0].src = this;
    //     });
    // }

    // // Usage:

    // $(hack).preload();

    // $('body').css("background-image", "url(/images/pictures/" + hack[0] + ")");
    var i = 1;
    
    
    var background_image = setInterval(function() {
        $('.testclass').css('background-image', "url(/images/pictures/" + hack[i] + ")");
        if (i < 9) i++;
        else i = 0;
    }, 10000);

    

    // Load widgets
    var Refresh = function() {
        $(".widget").remove();
        $.get( "/api/widgets", function( data ) {
            $.each(data.docs, function(key, doc) {
                $(".dashboard").append(
                    "<div class='" + doc.type + " widget' id='" + doc._id + "'>" +
                    "<div class='data type'>" + doc.type + "</div>" +
                    "<div class='data type_id'>" + doc.type_id + "</div>" +
                    "<div class='data rev'>" + doc._rev + "</div>" +
                    "<div class='widget_content'></div>" +
                    "</div>"
                );

                if (doc.type == "weather") {
                    var urlNow = "http://api.openweathermap.org/data/2.5/weather?q=EastLansing,MI&appid=269cf0387e2d75cb2d84effa38819bd2"
                    var url5Day = "http://api.openweathermap.org/data/2.5/forecast/daily?q=EastLansing,MI&count=5&appid=269cf0387e2d75cb2d84effa38819bd2"

                    $.getJSON(urlNow).then(function(dataNow) {
                        $.getJSON(url5Day).then(function(data5Day) {
                            console.log( dataNow );
                            console.log( data5Day );

                            var description = "<BR />\n<b>Current Conditions : "+dataNow.name+"</b>\n<BR />" + Math.round((9.0 / 5.0) * (dataNow.main.temp - 273.15) + 32) + " - " + dataNow.weather[0].main + "\n<BR />\n \
                            <BR />\n<b>Forecast:</b>\n";

                            for(var i = 0; i < 5; i++) {
                                description += "<BR /> "+new Date(data5Day.list[i].dt * 1000).toString().split(' ')[0]+" : "+data5Day.list[i].weather[0].main+" - High: "+Math.round((9.0 / 5.0) * (data5Day.list[i].temp.max - 273.15) + 32)+" Low: "+Math.round((9.0 / 5.0) * (data5Day.list[i].temp.max - 273.15) + 32)+"\n";
                            }
                            description += "\n\<BR />";


                            $('.weather > .widget_content').html(
                                "<span>" + description + "</span>"
                            );
                        });
                    });
                }

                // if(doc.type == "news") {
                    

                    
                // }

                if (doc.type == "text") {
                    $('.text > .widget_content').html(
                        "<span>You have no new texts.</span>"
                    );
                }

                if (doc.type == "twitter") {
                    $('.twitter > .widget_content').html(
                        "<a class=\"twitter-timeline\" data-width=\"220\" data-height=\"200\" href=\"https://twitter.com/Speceottar\">Tweets by Speceottar</a> <script async src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>"
                    );
                }

                if (doc.type == "video") {
                    $('.video > .widget_content').html(
                        "<span><div id='player'></div></span>" +
                        "<script>" +
                        "var tag = document.createElement('script');" +
                        "tag.src = 'https://www.youtube.com/iframe_api';" +
                        "var firstScriptTag = document.getElementsByTagName('script')[0];" +
                        "firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);" +
                        "var player;"+
                        "function onYouTubeIframeAPIReady() {"+
                        "player = new YT.Player('player', {"+
                        "height: '150',"+
                        "width: '250',"+
                        "videoId: 'M7lc1UVf-VE',"+
                        "events: {"+
                        "'onReady': onPlayerReady,"+
                        "'onStateChange': onPlayerStateChange"+
                        "}"+
                        "});"+
                        "}"+
                        "function onPlayerReady(event) {"+
                        "event.target.playVideo();"+
                        "}"+
                        "var done = false;"+
                        "function onPlayerStateChange(event) {"+
                        "if (event.data == YT.PlayerState.PLAYING && !done) {"+
                        "done = true;"+
                        "}"+
                        "}"+
                        "function stopVideo() {"+
                        "player.stopVideo();"+
                        "}"+
                        "</script>"+
                        ");")
                }

                var widget = $("#" + doc._id);
                widget.css("height", ((parseFloat(doc.y2) - parseFloat(doc.y1))*100) + "%");
                widget.css("width", ((parseFloat(doc.x2) - parseFloat(doc.x1))*100) + "%");
                widget.css( "left", (parseFloat(doc.x1)*100) + "%");
                widget.css( "top", (parseFloat(doc.y1)*100) + "%");
                //$("#" + doc._id + " > .widget_content").css("line-height", (widget.height() - 50) + "px");

                widget.resizable({
                    //grid: [ 25, 25 ],
                    start: function(event, ui){
                    },
                    resize: function(event, ui){
                        $("#" + doc._id + " > .widget_content").css("line-height", (widget.height() - 50) + "px");
                    },
                    stop: function(event, ui){
                        var x1 = ui.position.left / $(window).width();
                        var x2 = x1 + (ui.size.width / $(window).width());
                        var y1 = ui.position.top / $(window).height();
                        var y2 = y1 + (ui.size.height / $(window).height());

                        $.post( "/api/drop", {
                            rev: $(this).find('.rev').html(),
                            id: $(this).attr('id'),
                            type: $(this).find('.type').html(),
                            type_id: $(this).find('.type_id').html(),
                            x1: x1.toString(),
                            x2: x2.toString(),
                            y1: y1.toString(),
                            y2: y2.toString()
                        }, function( data ) {
                            // Refresh Chromecast!!!!
                            UpdateChromecast();
                            $(this).find('.rev').html(data.rev)
                        }, "json");
                    }
                });
            });




            $( ".widget" ).draggable({
                start: function(event, ui) {
                    $(".trashcan").show();
                },
                containment: "parent",
                stop: function(event, ui){
                    var x1 = ui.position.left / $(window).width();
                    var x2 = x1 + ($(this).width() / $(window).width());
                    var y1 = ui.position.top / $(window).height();
                    var y2 = y1 + ($(this).height() / $(window).height());

                    $(".trashcan").hide();
                    if ( x2 > .9 && y2 > .9 ){
                        $.post( "/api/delete", {
                            rev: $(this).find('.rev').html(),
                            id: $(this).attr('id'),
                            type: $(this).find('.type').html(),
                            type_id: $(this).find('.type_id').html(),
                            x1: x1.toString(),
                            x2: x2.toString(),
                        }, function( data ) {
                            // Refresh Chromecast!!!!
                            Refresh();
                            UpdateChromecast();
                            $(this).find('.rev').html(data.rev)
                        }, "json");
                    }
                    else{
                        $.post( "/api/drop", {
                            rev: $(this).find('.rev').html(),
                            id: $(this).attr('id'),
                            type: $(this).find('.type').html(),
                            type_id: $(this).find('.type_id').html(),
                            x1: x1.toString(),
                            x2: x2.toString(),
                            y1: y1.toString(),
                            y2: y2.toString()
                        }, function( data ) {
                            // Refresh Chromecast!!!!
                            UpdateChromecast();
                            $(this).find('.rev').html(data.rev)
                        }, "json");
                    }
                }
            });


        });
    };

    // Initial load
    Refresh();


    $(".clock_button").click(function() {
        $.post( "/api/add", {
            type: "clock",
            type_id: "123",
            x1: (0).toString(),
            x2: (.3).toString(),
            y1: (0).toString(),
            y2: (.3).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");

        $(".widgetList").hide();
    });

    $(".weather_button").click(function() {
        $.post( "/api/add", {
            type: "weather",
            type_id: "123",
            x1: (0).toString(),
            x2: (.3).toString(),
            y1: (0).toString(),
            y2: (.3).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");

        $(".widgetList").hide();
    });

    $(".text_button").click(function() {
        $.post( "/api/add", {
            type: "text",
            type_id: "123",
            x1: (0).toString(),
            x2: (.3).toString(),
            y1: (0).toString(),
            y2: (.3).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");

        $(".widgetList").hide();
    });

    $(".twitter_button").click(function() {
        $.post( "/api/add", {
            type: "twitter",
            type_id: "123",
            x1: (0).toString(),
            x2: (.4).toString(),
            y1: (0).toString(),
            y2: (.7).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");

        $(".widgetList").hide();
    });

    $(".video_button").click(function() {
        $.post( "/api/add", {
            type: "video",
            type_id: "123",
            x1: (0).toString(),
            x2: (.45).toString(),
            y1: (0).toString(),
            y2: (.7).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");

        $(".widgetList").hide();
    });

    $(".calendar").click(function() {
        $.post( "/api/add", {
            type: "calendar",
            type_id: "123",
            x1: (0).toString(),
            x2: (.3).toString(),
            y1: (0).toString(),
            y2: (.3).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");

        $(".widgetList").hide();
    });

    $(".news").click(function() {
        $.post( "/api/add", {
            type: "news",
            type_id: "123",
            x1: (0).toString(),
            x2: (.3).toString(),
            y1: (0).toString(),
            y2: (.3).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");

        $(".widgetList").hide();
    });


    $(".widgetList").hide();

    $(".trashcan").hide();


    $(".plus").click(function() {
        $(".widgetList").toggle();
    });




    // $(".widget").mouseup(function(){
    //     clearTimeout(pressTimer);
    //     // Clear timeout
    //     return false;
    // }).mousedown(function(){
    //     // Set timeout
    //     pressTimer = window.setTimeout(function() {$(this).remove()},1000);
    //     return false;
    // });


    function UpdateChromecast() {
        // android.update();
    }

});