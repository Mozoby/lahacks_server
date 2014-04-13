var exec = require('child_process').exec;
var http = require('http');
var fs = require('fs');

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
		console.log(socket.get('userId'));
		socket.set('clusterID',null);
		socket.set('answer',null);
	});

	socket.on('disconnect',function(data){
		clientCount -= 1;
	});

	socket.on('answer',function(data){
		socket.set('answer', data.answer);
	});
});

setInterval(function() {
	if(isStarted){
		//group users with same answers who already in the same cluster

		// or with users who have no cluster
		//set null all answers

		//set
	}
},15000);