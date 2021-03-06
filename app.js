/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    receiver = require('./routes/receiver'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    session = require('client-sessions');

var app = express();

var db;
var users_table;
var widgets_table;
var clocks_table;

var cloudant;

var fileToUpload;

var dbCredentials = {
    dbName: 'clock'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    cookieName: 'session',
    secret: '1234567890',
    duration: 30 * 60 * 100000,
    activeDuration: 5 * 60 * 100000,
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

function initDBConnection() {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
        // Pattern match to find the first instance of a Cloudant service in
        // VCAP_SERVICES. If you know your service key, you can access the
        // service credentials directly by using the vcapServices object.
        for (var vcapService in vcapServices) {
            if (vcapService.match(/cloudant/i)) {
                dbCredentials.url = vcapServices[vcapService][0].credentials.url;
            }
        }
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
        //dbCredentials.url = "https://zambezi64@gmail.com:Thisistopsecret12!@d12fa842-2701-4087-ac26-099578785674-bluemix.cloudant.com";
        dbCredentials.url = "https://d12fa842-2701-4087-ac26-099578785674-bluemix:39557617ef9f767de0f05a55588cf460e5594112e9dbe45ed857704548c7681f@d12fa842-2701-4087-ac26-099578785674-bluemix.cloudant.com";
    }

    cloudant = require('cloudant')(dbCredentials.url);

    cloudant.db.destroy('widgets', function (err) {
        cloudant.db.create("widgets", function (err, res) {
            if (err) {
                console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
            }
        });
    });

    db = cloudant.use(dbCredentials.dbName);
    users_table = cloudant.use("users");
    widgets_table = cloudant.use("widgets");
    clocks_table = cloudant.use("clock");
}

initDBConnection();

app.get('/', function (req, res) {
    if (req.session.user) {
        console.log(req.session.user);
        res.render('index.html');
    }
    else {
        res.redirect('/signup');
    }
});

app.get('/receiver', function (req, res) {

    res.render('receiver.html');

});

app.get('/sender', function (req, res) {
    //res.render('receiver.html');
    if (req.session.user) {
        console.log(req.session.user);
        res.render('sender.html');
    }
    else {
        res.redirect('/login');
    }
});

app.post('/api/validate', function (req, res) {
    console.log("Validating");
    users_table.find({selector: {email: req.body.email}}, function (err, results) {
        if (!results.docs[0]) {
            res.setHeader('Content-Type', 'application/json');
            res.send("Go fuck yourself");
            console.log("Go fuck yourself");
        } else {
            user = results.docs[0];
            console.log("This is /api/validate");
            console.log(user);
            if (req.body.password == user.password) {
                req.session.user = user;
                res.setHeader('Content-Type', 'application/json');
                res.send(req.session.user);
                //res.render('receiver.html');
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.send("Go fuck yourself again");
            }
        }
    });
});

app.get('/signup', function (req, res) {
    res.render('SignUp.html');
});

app.get('/login', function (req, res) {
    res.render('login.html');
});

app.post('/createUser', function (req, res) {
    users_table.insert({
        "email": req.body.email,
        "password": req.body.password
    }, function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            result.email = req.body.email;
            req.session.user = result;
            res.redirect('/receiver');
        }
        res.end();
    });
});

app.post('/loginUser', function (req, res) {
    users_table.find({selector: {email: req.body.email}}, function (err, results) {
        if (!results.docs[0]) {
            res.render('login.html', {error: 'Invalid email.'});
        } else {
            user = results.docs[0];
            console.log("This is /loginUser");
            console.log(user);
            if (req.body.password == user.password) {
                req.session.user = user;
                res.setHeader('Content-Type', 'application/json');
                res.send(req.session.user);
                //res.render('receiver.html');
            } else {
                res.render('login.html', {error: 'Invalid email or password.'});
            }
        }
    });
});

app.get('/api/widgets', function (req, res) {
    widgets_table.find({selector: {user: req.session.user._id}}, function (err, results) {
        res.setHeader('Content-Type', 'application/json');
        res.send(results);
    });
});

app.post('/api/add', function (req, res) {
    widgets_table.insert({
        "user": req.session.user._id,
        "x1": req.body.x1,
        "x2": req.body.x2,
        "y1": req.body.y1,
        "y2": req.body.y2,
        "type": req.body.type,
        "type_id": req.body.type_id
    }, function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            //result.email = req.body.email;
            //req.session.user = result;
            res.send(result);
        }
        res.end();
    });
});

app.post('/api/drop', function (req, res) {
    widgets_table.find({selector: {_id: req.body.id}}, function (err, results) {
        var doc = results.docs[0];
        doc.x1 = req.body.x1;
        doc.x2 = req.body.x2;
        doc.y1 = req.body.y1;
        doc.y2 = req.body.y2;

        widgets_table.insert(doc, function (err, result) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.send(result);
            }
            res.end();
        });
    });
});


app.post('/api/delete', function (req, res) {
    widgets_table.find({selector: {_id: req.body.id}}, function (err, results) {
        var doc = results.docs[0];
        doc.x1 = -100;
        doc.x2 = -120;

        widgets_table.insert(doc, function (err, result) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.send(result);
            }
            res.end();
        });

    });
});

app.get('/api/session', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(req.session.user);
});

//
//function createResponseData(id, name, value, attachments) {
//
//    var responseData = {
//        id: id,
//        name: name,
//        value: value,
//        attachements: []
//    };
//
//
//    attachments.forEach(function(item, index) {
//        var attachmentData = {
//            content_type: item.type,
//            key: item.key,
//            url: '/api/favorites/attach?id=' + id + '&key=' + item.key
//        };
//        responseData.attachements.push(attachmentData);
//
//    });
//    return responseData;
//}
//
//var saveDocument = function(id, name, value, response) {
//
//    if (id === undefined) {
//        // Generated random id
//        id = '';
//    }
//
//    db.insert({
//        name: name,
//        value: value
//    }, id, function(err, doc) {
//        if (err) {
//            console.log(err);
//            response.sendStatus(500);
//        } else
//            response.sendStatus(200);
//        response.end();
//    });
//
//}
//
//app.get('/api/favorites/attach', function(request, response) {
//    var doc = request.query.id;
//    var key = request.query.key;
//
//    db.attachment.get(doc, key, function(err, body) {
//        if (err) {
//            response.status(500);
//            response.setHeader('Content-Type', 'text/plain');
//            response.write('Error: ' + err);
//            response.end();
//            return;
//        }
//
//        response.status(200);
//        response.setHeader("Content-Disposition", 'inline; filename="' + key + '"');
//        response.write(body);
//        response.end();
//        return;
//    });
//});
//
//app.post('/api/favorites/attach', multipartMiddleware, function(request, response) {
//
//    console.log("Upload File Invoked..");
//    console.log('Request: ' + JSON.stringify(request.headers));
//
//    var id;
//
//    db.get(request.query.id, function(err, existingdoc) {
//
//        var isExistingDoc = false;
//        if (!existingdoc) {
//            id = '-1';
//        } else {
//            id = existingdoc.id;
//            isExistingDoc = true;
//        }
//
//        var name = request.query.name;
//        var value = request.query.value;
//
//        var file = request.files.file;
//        var newPath = './public/uploads/' + file.name;
//
//        var insertAttachment = function(file, id, rev, name, value, response) {
//
//            fs.readFile(file.path, function(err, data) {
//                if (!err) {
//
//                    if (file) {
//
//                        db.attachment.insert(id, file.name, data, file.type, {
//                            rev: rev
//                        }, function(err, document) {
//                            if (!err) {
//                                console.log('Attachment saved successfully.. ');
//
//                                db.get(document.id, function(err, doc) {
//                                    console.log('Attachements from server --> ' + JSON.stringify(doc._attachments));
//
//                                    var attachements = [];
//                                    var attachData;
//                                    for (var attachment in doc._attachments) {
//                                        if (attachment == value) {
//                                            attachData = {
//                                                "key": attachment,
//                                                "type": file.type
//                                            };
//                                        } else {
//                                            attachData = {
//                                                "key": attachment,
//                                                "type": doc._attachments[attachment]['content_type']
//                                            };
//                                        }
//                                        attachements.push(attachData);
//                                    }
//                                    var responseData = createResponseData(
//                                        id,
//                                        name,
//                                        value,
//                                        attachements);
//                                    console.log('Response after attachment: \n' + JSON.stringify(responseData));
//                                    response.write(JSON.stringify(responseData));
//                                    response.end();
//                                    return;
//                                });
//                            } else {
//                                console.log(err);
//                            }
//                        });
//                    }
//                }
//            });
//        }
//
//        if (!isExistingDoc) {
//            existingdoc = {
//                name: name,
//                value: value,
//                create_date: new Date()
//            };
//
//            // save doc
//            db.insert({
//                name: name,
//                value: value
//            }, '', function(err, doc) {
//                if (err) {
//                    console.log(err);
//                } else {
//
//                    existingdoc = doc;
//                    console.log("New doc created ..");
//                    console.log(existingdoc);
//                    insertAttachment(file, existingdoc.id, existingdoc.rev, name, value, response);
//
//                }
//            });
//
//        } else {
//            console.log('Adding attachment to existing doc.');
//            console.log(existingdoc);
//            insertAttachment(file, existingdoc._id, existingdoc._rev, name, value, response);
//        }
//
//    });
//
//});
//
//app.post('/api/favorites', function(request, response) {
//
//    console.log("Create Invoked..");
//    console.log("Name: " + request.body.name);
//    console.log("Value: " + request.body.value);
//
//    // var id = request.body.id;
//    var name = request.body.name;
//    var value = request.body.value;
//
//    saveDocument(null, name, value, response);
//
//});
//
//app.delete('/api/favorites', function(request, response) {
//
//    console.log("Delete Invoked..");
//    var id = request.query.id;
//    // var rev = request.query.rev; // Rev can be fetched from request. if
//    // needed, send the rev from client
//    console.log("Removing document of ID: " + id);
//    console.log('Request Query: ' + JSON.stringify(request.query));
//
//    db.get(id, {
//        revs_info: true
//    }, function(err, doc) {
//        if (!err) {
//            db.destroy(doc._id, doc._rev, function(err, res) {
//                // Handle response
//                if (err) {
//                    console.log(err);
//                    response.sendStatus(500);
//                } else {
//                    response.sendStatus(200);
//                }
//            });
//        }
//    });
//
//});
//
//app.put('/api/favorites', function(request, response) {
//
//    console.log("Update Invoked..");
//
//    var id = request.body.id;
//    var name = request.body.name;
//    var value = request.body.value;
//
//    console.log("ID: " + id);
//
//    db.get(id, {
//        revs_info: true
//    }, function(err, doc) {
//        if (!err) {
//            console.log(doc);
//            doc.name = name;
//            doc.value = value;
//            db.insert(doc, doc.id, function(err, doc) {
//                if (err) {
//                    console.log('Error inserting data\n' + err);
//                    return 500;
//                }
//                return 200;
//            });
//        }
//    });
//});
//
//app.get('/api/favorites', function(request, response) {
//
//    console.log("Get method invoked.. ")
//
//    db = cloudant.use(dbCredentials.dbName);
//    var docList = [];
//    var i = 0;
//    db.list(function(err, body) {
//        if (!err) {
//            var len = body.rows.length;
//            console.log('total # of docs -> ' + len);
//            if (len == 0) {
//                // push sample data
//                // save doc
//                var docName = 'sample_doc';
//                var docDesc = 'A sample Document';
//                db.insert({
//                    name: docName,
//                    value: 'A sample Document'
//                }, '', function(err, doc) {
//                    if (err) {
//                        console.log(err);
//                    } else {
//
//                        console.log('Document : ' + JSON.stringify(doc));
//                        var responseData = createResponseData(
//                            doc.id,
//                            docName,
//                            docDesc, []);
//                        docList.push(responseData);
//                        response.write(JSON.stringify(docList));
//                        console.log(JSON.stringify(docList));
//                        console.log('ending response...');
//                        response.end();
//                    }
//                });
//            } else {
//
//                body.rows.forEach(function(document) {
//
//                    db.get(document.id, {
//                        revs_info: true
//                    }, function(err, doc) {
//                        if (!err) {
//                            if (doc['_attachments']) {
//
//                                var attachments = [];
//                                for (var attribute in doc['_attachments']) {
//
//                                    if (doc['_attachments'][attribute] && doc['_attachments'][attribute]['content_type']) {
//                                        attachments.push({
//                                            "key": attribute,
//                                            "type": doc['_attachments'][attribute]['content_type']
//                                        });
//                                    }
//                                    console.log(attribute + ": " + JSON.stringify(doc['_attachments'][attribute]));
//                                }
//                                var responseData = createResponseData(
//                                    doc._id,
//                                    doc.name,
//                                    doc.value,
//                                    attachments);
//
//                            } else {
//                                var responseData = createResponseData(
//                                    doc._id,
//                                    doc.name,
//                                    doc.value, []);
//                            }
//
//                            docList.push(responseData);
//                            i++;
//                            if (i >= len) {
//                                response.write(JSON.stringify(docList));
//                                console.log('ending response...');
//                                response.end();
//                            }
//                        } else {
//                            console.log(err);
//                        }
//                    });
//
//                });
//            }
//
//        } else {
//            console.log(err);
//        }
//    });
//
//});


http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});
