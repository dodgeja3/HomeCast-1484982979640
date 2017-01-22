$(document).ready(function () {
    // utility function to display the text message in the input field
    function process(message) {
        // document.getElementById("test").innerHTML=message;
        // window.castReceiverManager.setApplicationState(message);

        //$(".test").html(message);
        json = JSON.parse(message);
        
        if(json.action == "login") {
            var u = json.user;
            $.post( "/api/validate", {
               email: u.email,
               password: u.password
            }, function( data ) {
                
            }, "json");
        } else if (json.action == "update") {
            
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
                        var description = "<![CDATA[<img src=\"http://l.yimg.com/a/i/us/we/52/29.gif\"/>\n<BR />\n<b>Current Conditions:</b>\n<BR />Partly Cloudy\n<BR />\n<BR />\n<b>Forecast:</b>\n<BR /> Sat - Partly Cloudy. High: 55Low: 40\n<BR /> Sun - Cloudy. High: 48Low: 40\n<BR /> Mon - Cloudy. High: 43Low: 38\n<BR /> Tue - Mostly Cloudy. High: 42Low: 33\n<BR /> Wed - Rain. High: 42Low: 37\n<BR />\n<BR />\n<a href=\"http://us.rd.yahoo.com/dailynews/rss/weather/Country__Country/*https://weather.yahoo.com/country/state/city-2436453/\">Full Forecast at Yahoo! Weather</a>\n<BR />\n<BR />\n(provided by <a href=\"http://www.weather.com\" >The Weather Channel</a>)\n<BR />\n]]>";
                        $('.weather > .widget_content').html(
                            "<span>" + description + "</span>"
                        );

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
                });
            });
        }
    }


    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');
    // handler for the 'ready' event
    castReceiverManager.onReady = function (event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState("Application status is ready...");
    };
    // handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = function (event) {
        console.log('Received Sender Connected event: ' + event.data);
        console.log(window.castReceiverManager.getSender(event.data).userAgent);
    };
    // handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = function (event) {
        console.log('Received Sender Disconnected event: ' + event.data);
        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }
    };
    // handler for 'systemvolumechanged' event
    castReceiverManager.onSystemVolumeChanged = function (event) {
        console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
            event.data['muted']);
    };
    // create a CastMessageBus to handle messages for a custom namespace
    window.messageBus =
        window.castReceiverManager.getCastMessageBus(
            'urn:x-cast:com.google.cast.sample.helloworld');
    // handler for the CastMessageBus message event
    window.messageBus.onMessage = function (event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);
        // display the message from the sender
        process(event.data);
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.messageBus.send(event.senderId, event.data);
    };
    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');
});