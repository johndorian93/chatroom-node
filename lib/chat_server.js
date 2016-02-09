/**
 * Created by Patryk on 2016-02-09.
 */
var socketio = require("socket.io");
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function (server) {
    io = socketio.listen(server);
    io.set('log level', 1);

    io.socket.on('connection', function(socket){
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'Lobby');

        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);

        socket.on('rooms', function () {
           socket.emit('rooms', io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket, nickNames, namesUsed);
    });
};

function joinRoom(socket, room){
    socket.join(room);
    currentRoom[socket.id] = room;

    socket.emit('joinResult', {
        room: room
    });

    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + " dolaczyl do pokoju " + room
    });

    var usersInRoom = io.sockets.clients(room);

    if(usersInRoom.length > 1){
        var usersInRoomSummary = "Lista uzytkownikow w pokoju " + room + ": ";

        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary += ", ";
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }

        usersInRoomSummary += '.';
        socket.emit('message', {
            text: usersInRoomSummary
        });
    }
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed){
    var name = "Gosc" + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    namesUsed.push(name);
    return guestNumber + 1;
}