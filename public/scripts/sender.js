$(document).ready(function () {
    $.get( "/api/session", function( data ) {
        android.login(JSON.stringify(data));
    });
});