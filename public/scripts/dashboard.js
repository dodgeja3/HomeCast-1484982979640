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
    }, 100);

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
                    var url = "http://api.openweathermap.org/data/2.5/weather?q=EastLansing,MI&appid=269cf0387e2d75cb2d84effa38819bd2"

                    $.getJSON(url).then(function(data) {
                        console.log( );

                        


                        var description = "Temp: " + Math.round((9.0 / 5.0) * (data.main.temp - 273.15) + 32);
                        $('.weather > .widget_content').html(
                            "<span>" + description + "</span>"
                        );
                    });

                    // var description = "<![CDATA[<img src=\"http://l.yimg.com/a/i/us/we/52/29.gif\"/>\n<BR />\n<b>Current Conditions:</b>\n<BR />Partly Cloudy\n<BR />\n<BR />\n<b>Forecast:</b>\n<BR /> Sat - Partly Cloudy. High: 55Low: 40\n<BR /> Sun - Cloudy. High: 48Low: 40\n<BR /> Mon - Cloudy. High: 43Low: 38\n<BR /> Tue - Mostly Cloudy. High: 42Low: 33\n<BR /> Wed - Rain. High: 42Low: 37\n<BR />\n<BR />\n<a href=\"http://us.rd.yahoo.com/dailynews/rss/weather/Country__Country/*https://weather.yahoo.com/country/state/city-2436453/\">Full Forecast at Yahoo! Weather</a>\n<BR />\n<BR />\n(provided by <a href=\"http://www.weather.com\" >The Weather Channel</a>)\n<BR />\n]]>";
                    

                    //$.get( "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22lansing%2C%20mi%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys", function( data ) {
                    //    //var description = data.query.results.channel.item.description;
                    //    var description = "<![CDATA[<img src=\"http://l.yimg.com/a/i/us/we/52/29.gif\"/>\n<BR />\n<b>Current Conditions:</b>\n<BR />Partly Cloudy\n<BR />\n<BR />\n<b>Forecast:</b>\n<BR /> Sat - Partly Cloudy. High: 55Low: 40\n<BR /> Sun - Cloudy. High: 48Low: 40\n<BR /> Mon - Cloudy. High: 43Low: 38\n<BR /> Tue - Mostly Cloudy. High: 42Low: 33\n<BR /> Wed - Rain. High: 42Low: 37\n<BR />\n<BR />\n<a href=\"http://us.rd.yahoo.com/dailynews/rss/weather/Country__Country/*https://weather.yahoo.com/country/state/city-2436453/\">Full Forecast at Yahoo! Weather</a>\n<BR />\n<BR />\n(provided by <a href=\"http://www.weather.com\" >The Weather Channel</a>)\n<BR />\n]]>";
                    //    $('.weather > .widget_content').html(
                    //        "<span>" + description + "</span>"
                    //    );
                    //});
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
                containment: "parent",
                stop: function(event, ui){
                    var x1 = ui.position.left / $(window).width();
                    var x2 = x1 + ($(this).width() / $(window).width());
                    var y1 = ui.position.top / $(window).height();
                    var y2 = y1 + ($(this).height() / $(window).height());

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
    };

    // Initial load
    Refresh();


    // $(".add").click(function() {
    //     $.post( "/api/add", {
    //         type: "clock",
    //         type_id: "123",
    //         x1: 0,
    //         x2: .3,
    //         y1: 0,
    //         y2: .2
    //     }, function( data ) {
    //         UpdateChromecast();
    //         Refresh();
    //     }, "json");
    // });
    $(".clock").click(function() {
        $.post( "/api/add", {
            type: "clock",
            type_id: "123",
            x1: (0).toString(),
            x2: (.3).toString(),
            y1: (0).toString(),
            y2: (.25).toString()
        }, function( data ) {
            UpdateChromecast();
            Refresh();
        }, "json");
    });

    $(".weather").click(function() {
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
    });

    $(".widgetList").hide();

    $(".plus").click(function() {
        $(".widgetList").toggle();
    });


    function UpdateChromecast() {
        //android.update();
    }

});