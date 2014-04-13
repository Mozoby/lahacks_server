var exec = require('child_process').exec;
var http = require('http');
var fs = require('fs');
var path = require('path');

require('./questions.js');


function uuid(){
    var s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return s;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

//set up http server for receiving git post-push events for auto-deployment to the server
http.createServer(function(req,res) {
    console.log(req.url);
    if(req.url=='/gitpull'){
        child = exec('git pull', function(error,stdout,stderr){
            fs.writeFile("./gitresults.txt", stdout, function(err){
                //do nothing
            });
        });
    }else if(req.url == '/'){
        fs.readFile('app/index.html', function(err, page) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
        });
    }else{
        path.exists('app' + req.url,function(exists){
            if(exists){
                fs.readFile('app' + req.url, function(err, page) {
                    if(endsWith(req.url,'.css'))
                     res.writeHead(200, {'Content-Type': 'text/css'});
                    else if(endsWith(req.url,'.js'))
                        res.writeHead(200, {'Content-Type': 'application/javascript'});
                    else if(endsWith(req.url,'.png') )
                        res.writeHead(200, {'Content-Type': 'image/png'});
                    else
                        res.writeHead(200, {'Content-Type': 'text/html'});

                    res.write(page);
                    res.end();
                });
            }else{
                res.writeHead(400);
                res.end();
            }
        });
    }
}).listen(80,'0.0.0.0');

//set up websocket to listen for new hosts
var io = require('socket.io').listen(8080);

var clientCount = 0;
var isStarted = false;

io.sockets.on('connection', function(socket) {
    console.log('connection established: ' + clientCount );
    clientCount += 1;
    socket.on('initialize', function(userId) {
        
        if(clientCount > 4){
            isStarted = true;
            console.log("Game will Start...");
        }
        socket.set('userId', userId, function(){
            console.log(userId);
        });
        io.sockets.emit('update', {clusterCount: clientCount});
        //console.log(socket.get('userId'));
    });

    socket.on('disconnect',function(data){
        clientCount -= 1;
    });

    socket.on('answer',function(data){
        socket.set('answer', data.answer);
        console.log(data.answer);
    });
});

var natural = require('natural');
var string_similarity_threshold = 0.72;

var questionIndex = 0;
var roomsCreated = 0;

var startInterval = setInterval(function() {
    if(isStarted){
        console.log("Game Starting!");
        //broadcast next question
        io.sockets.emit('question', questions[questionIndex%questions.length]);

        questionIndex ++;
        setInterval(function(){
            //group users with same answers
            if(io.sockets.manager.rooms.length > 0){
                console.log(io.sockets.manager.rooms);
                Object.keys(io.sockets.manager.rooms).forEach(function(roomName){
                    
                    newRooms = []; // {answer:'', name:''}
                    roomClientCount = io.sockets.clients(roomName).length;
                    clientsProcessed = 0;
                    io.sockets.clients(roomName).forEach(function (socket) {
                        socket.leave(roomName);
                        socket.get('answer', function (err, answer) {
                            joined = false;
                            if(answer !== null){
                                newRooms.forEach(function(roomObj){
                                    if(!joined){
                                        if(natural.JaroWinklerDistance(answer,roomObj.answer) >= string_similarity_threshold){
                                            joined = true;
                                            socket.join(roomObj.name);
                                            Console.log("Joining Room on answer: " + answer);
                                        }
                                    }
                                });
                                if(!joined){
                                    newName = uuid();
                                    newRooms.push({answer:answer, name: newName});
                                    socket.join(newName);
                                    roomsCreated += 1;
                                    Console.log("New Room Created!");
                                }
                            }
                        });
                    });
                });
            }else{
                if(roomsCreated > 0){
                    //game needs to restart
                    roomsCreated = 0;
                    Console.log("Restarting Game.");
                    isStarted = false;
                    clientCount = 0;
                    sockets.io.emit('restart',null);
                }else{
                    //users which have no room assigned yet (beginning only)
                    newRooms = []; // {answer:'', name:''}
                    io.sockets.clients().forEach(function (socket) {
                        socket.get('answer', function (err, answer) {
                            joined = false;
                            if(answer !== null){
                                newRooms.forEach(function(roomObj){
                                    if(!joined){
                                        if(natural.JaroWinklerDistance(answer,roomObj.answer) >= string_similarity_threshold){
                                            joined = true;
                                            socket.join(roomObj.name);
                                        }
                                    }
                                });
                                if(!joined){
                                    newName = uuid();
                                    newRooms.push({answer:answer, name: newName});
                                    socket.join(newName);
                                }
                            }
                        });
                    });
                }
            }
            //set timeout in order to accomodate th non-blocking io of socket.get
            setTimeout(function(){
                //update all users with cluster count
                Console.log("Rooms:");
                console.log(io.sockets.manager.rooms);
                Object.keys(io.sockets.manager.rooms).forEach(function(roomName){
                    Console.log(roomName + ': ' + clusterCount.io.sockets.clients(roomName).length);
                    io.sockets.clients(roomName).forEach(function(socket){
                        socket.emit('update', {clusterCount:io.sockets.clients(roomName).length});
                    });

                    //if theres less than or equal to 2 people in the room exchange userIds
                    if(io.sockets.clients(roomName).length <= 2){
                        roomId = uuid();
                        io.sockets.clients(roomName).forEach(function(socket){
                            io.sockets.clients(roomName).forEach(function(socket2){
                                if(socket2.id != socket.id){
                                    socket2.get('userId',function(err,userId){
                                        socket.emit('finalize', {roomId:roomId});
                                    });
                                }
                            });
                        });
                    }
                });

                //set all answers to null
                io.sockets.clients().forEach(function (socket) {
                    socket.set('answer',null);
                });

                //broadcast next question
                io.sockets.emit('question', questions[questionIndex]);

                questionIndex ++;
            },3000);
            

            
        },17000);
        clearInterval(startInterval);
    }
},30000);