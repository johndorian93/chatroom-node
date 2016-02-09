/**
 * Created by Patryk on 2016-02-09.
 */
var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var chatServer = require("./lib/chat_server");
var cache = {};

var server = http.createServer(function (request, response) {
    var filePath = false;
    if(request.url == "/"){
        filePath = 'public/index.html';
    }else{
        filePath = 'public/'+request.url;
    }

    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(3000, function(){
    console.log("Serwer nasluchuje na porcie " + 3000);
});

chatServer.listen(server);

function send404(response){
    response.writeHead(404, {'ContentType' : 'text/plain'});
    response.write("Blad 404: plik nie zostal znaleziony");
    response.end();
}

function sendFile(response, filePath, fileContents){
    response.writeHead(200, {"content-type" : mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

function serveStatic(response, cache, absPath){
    if(cache[absPath]){
        sendFile(response,absPath,cache[absPath]);
    }
    else{
        fs.exists(absPath, function (exists) {
           if(exists){
               fs.readFile(absPath, function (err, data) {
                   if(err){
                       send404(response);
                   }
                   else{
                       cache[absPath] = data;
                       sendFile(response, absPath,data);
                   }
               });
           }
           else{
            send404(response);
           }
        });
    }
}