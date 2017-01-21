
/*
 * GET receiver page.
 */

exports.receiver = function(req, res){
    res.render('receiver.html', { title: 'Receiver' });
};