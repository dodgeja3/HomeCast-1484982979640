$(document).ready(function () {
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
        Login(JSON.parse(event.data));
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.messageBus.send(event.senderId, event.data);
    };
    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');

    // utility function to display the text message in the input field
    function Login(user) {
        console.log(user);

        $.post( "/api/drop", {
            rev: $(this).find('.rev').html(),
            id: $(this).attr('id'),
            type: $(this).find('.type').html(),
            type_id: $(this).find('.type_id').html(),
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2
        }, function( data ) {
            // Refresh Chromecast!!!!
            UpdateChromecast();
            $(this).find('.rev').html(data.rev)
        }, "json");

        //document.getElementById("message").innerHTML = text;
        window.castReceiverManager.setApplicationState(user);
    }
});