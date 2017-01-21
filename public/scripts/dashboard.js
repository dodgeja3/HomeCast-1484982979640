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
    $('body').css("background-image", "url(/images/pictures/" + hack[0] + ")");
    var i = 1;
    var backgrount_image = setInterval(function() {
        $('body').css("background-image", "url(/images/pictures/" + hack[i] + ")");
        if (i < 9) i++;
        else i = 0;
    }, 20000);

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

                var widget = $("#" + doc._id);
                widget.height((doc.y2 - doc.y1));
                widget.width((doc.x2 - doc.x1));
                widget.css( "left", doc.x1 + "px" );
                widget.css( "top", doc.y1 + "px" );
                $("#" + doc._id + " > .widget_content").css("line-height", (widget.height() - 50) + "px");

                widget.resizable({
                    grid: [ 25, 25 ],
                    start: function(event, ui){
                    },
                    resize: function(event, ui){
                        $("#" + doc._id + " > .widget_content").css("line-height", (widget.height() - 50) + "px");
                    },
                    stop: function(event, ui){
                        var x1 = ui.position.left;
                        var x2 = x1 + ui.size.width;
                        var y1 = ui.position.top;
                        var y2 = y1 + ui.size.height;

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
                    }
                });
            });


            $( ".widget" ).draggable({
                grid: [ 25, 25 ],
                stop: function(event, ui){
                    var x1 = ui.position.left;
                    var x2 = x1 + $(this).width();
                    var y1 = ui.position.top;
                    var y2 = y1 + $(this).height();

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
                }
            });


        });
    };

    // Initial load
    Refresh();

    $(".add").click(function() {
        $.post( "/api/add", {
            type: "clock",
            type_id: "123",
            x1: 0,
            x2: 400,
            y1: 0,
            y2: 200
        }, function( data ) {
            Refresh();
            UpdateChromecast();
        }, "json");
    });

    function UpdateChromecast() {
        $.get( "/api/session", function( data ) {
            console.log(data);
            android.update(JSON.stringify(data));
        });
    }

});