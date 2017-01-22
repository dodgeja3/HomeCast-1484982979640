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
            document.getElementById("test").innerHTML=json.action;
            
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

                    var widget = $("#" + doc._id);
                    widget.css("height", (((doc.y2 - doc.y1)/$(window).height())*100) + "%");
                    widget.css("width", (((doc.x2 - doc.x1)/$(window).width())*100) + "%");
                    widget.css( "left", (((doc.x1 / $(window).width()))*100) + "%" );
                    widget.css( "top", (((doc.y1 / $(window).height()))*100) + "%" );
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