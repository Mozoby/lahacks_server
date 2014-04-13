var exec = require('child_process').exec;
var http = require('http');
var fs = require('fs');


function uuid(){
    var s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return s;
}

//set up http server for receiving git post-push events for auto-deployment to the server
http.createServer(function(req,res) {
    if(req.url=='/gitpull'){
        child = exec('git pull', function(error,stdout,stderr){
            fs.writeFile("./gitresults.txt", stdout, function(err){
                //do nothing
            });
        });
    }
});

//set up websocket to listen for new hosts
var io = require('socket.io').listen(8080);

var clientCount = 0;
var isStarted = false;

io.sockets.on('connection', function(socket) {
    clientCount += 1;
    if(clientCount > 4)
        isStarted = true;

    console.log('connection established: ' + clientCount );

    socket.on('initialize', function(userId) {
        
        socket.set('userId', userId, function(){
            console.log(userId);
        });
        socket.emit('update', {clusterCount: clientCount});
        //console.log(socket.get('userId'));
    });

    socket.on('disconnect',function(data){
        clientCount -= 1;
    });

    socket.on('answer',function(data){
        socket.set('answer', data.answer);
    });
});

var natural = require('natural');
var string_similarity_threshold = 0.72;

var questionIndex = 0;
var questions = [
    {question: "Question 1?", answers:['1','2','3','4']},
    {question: "Question 2?", answers:['1','2','3','4']},
    {question: "Question 3?", answers:['1','2','3','4']},
    {question: "Question 4?", answers:['1','2','3','4']},
    {question: "Question 5?", answers:['1','2','3','4']},
    {question: "Question 6?", answers:['1','2','3','4']},
    {question: "Question 7?", answers:['1','2','3','4']},
    {question: "Question 8?", answers:['1','2','3','4']},
    {question: "Question 9?", answers:['1','2','3','4']},
    {question: "Question 10?", answers:['1','2','3','4']},
    {question: "Question 11?", answers:['1','2','3','4']},
    {question: "Question 12?", answers:['1','2','3','4']},
    {question: "Question 13?", answers:['1','2','3','4']},
    {question: "Question 14?", answers:['1','2','3','4']}
];

var startInterval = setInterval(function() {
    if(isStarted){
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
                            newRooms.forEach(roomObj){
                                if(natural.JaroWinklerDistance(answer,roomObj.answer) >= string_similarity_threshold){
                                    joined = true;
                                    socket.join(roomObj.name);
                                    break;
                                }
                            }
                            if(!joined){
                                newName = uuid();
                                newRooms.append({answer:answer, name: newName});
                                socket.join(newName);
                            }
                        });
                    });
                });
            }else{
                //users which have no room assigned yet (beginning only)
                newRooms = []; // {answer:'', name:''}
                io.sockets.clients().forEach(function (socket) {
                    socket.get('answer', function (err, answer) {
                        joined = false;
                        newRooms.forEach(roomObj){
                            if(natural.JaroWinklerDistance(answer,roomObj.answer) >= string_similarity_threshold){
                                joined = true;
                                socket.join(roomObj.name);
                                break;
                            }
                        }
                        if(!joined){
                            newName = uuid();
                            newRooms.append({answer:answer, name: newName});
                            socket.join(newName);
                        }
                    });
                });

                
            }
            //set timeout in order to accomodate th non-blocking io of socket.get
            setTimeout(function(){
                //update all users with cluster count
                console.log(io.sockets.manager.rooms);
                Object.keys(io.sockets.manager.rooms).forEach(function(roomName){
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
            

            
        },12000);
        clearInterval(startInterval);
    }
},30000);