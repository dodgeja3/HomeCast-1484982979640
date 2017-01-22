$(document).ready(function () {

    var newsTitle = "Loading";
    var newsDescription = "Loading";

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
                    newsTitle = articles.articles[0].title;
                    newsDescription = articles.articles[0].description;

                    $('.news > .widget_content').html(
                        "<span><h1>"+newsTitle+"</h1><BR />"+newsDescription+"</span>"
                    );
                });
            }
        });
    }, 10000);

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
                        var urlNow = "http://api.openweathermap.org/data/2.5/weather?q=EastLansing,MI&appid=269cf0387e2d75cb2d84effa38819bd2"
                        var url5Day = "http://api.openweathermap.org/data/2.5/forecast/daily?q=EastLansing,MI&count=5&appid=269cf0387e2d75cb2d84effa38819bd2"

                        $.getJSON(urlNow).then(function(dataNow) {
                            $.getJSON(url5Day).then(function(data5Day) {
                                console.log( dataNow );
                                console.log( data5Day );

                                var description = "<![CDATA[<BR />\n<b>Current Conditions : "+dataNow.name+"</b>\n<BR />" + Math.round((9.0 / 5.0) * (dataNow.main.temp - 273.15) + 32) + " - " + dataNow.weather[0].main + "\n<BR />\n \
                                <BR />\n<b>Forecast:</b>\n";

                                for(var i = 0; i < 5; i++) {
                                    description += "<BR /> "+new Date(data5Day.list[i].dt * 1000).toString().split(' ')[0]+" : "+data5Day.list[i].weather[0].main+" - High: "+Math.round((9.0 / 5.0) * (data5Day.list[i].temp.max - 273.15) + 32)+" Low: "+Math.round((9.0 / 5.0) * (data5Day.list[i].temp.max - 273.15) + 32)+"\n";
                                }
                                description += "\n \<BR />";


                                $('.weather > .widget_content').html(
                                    "<span>" + description + "</span>"
                                );
                            });
                        });
                    }

                    if (doc.type == "news") {
                        $('.news > .widget_content').html(
                            "<span><h1>"+newsTitle+"</h1><BR />"+newsDescription+"</span>"
                        );
                    }

                    if (doc.type == "text" && json.text) {
                        $('.text > .widget_content').html(
                            "<span>" + json.text + "</span>"
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
                            "height: '200',"+
                            "width: '300',"+
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
                    $("#" + doc._id + " > .widget_content").css("line-height", (widget.height() - 50) + "px");
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