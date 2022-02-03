// =========================================================================
// Imports
// =========================================================================
const protocol = require( './UDP-orchestra-protocol');
const dgram = require('dgram');
const net = require('net');

// =========================================================================
// Musician storage and utilities
// =========================================================================
var activeMusicians = [];
var instrumentSounds = new Map();
instrumentSounds.set('ti-ta-ti', 'piano');
instrumentSounds.set('pouet', 'trumpet');
instrumentSounds.set('trulu', 'flute');
instrumentSounds.set('gzi-gzi', 'violin');
instrumentSounds.set('boum-boum', 'drum');


// =========================================================================
// UDP server
// =========================================================================
const udpServer = dgram.createSocket('udp4');
udpServer.bind(protocol.PROTOCOL_MULTICAST_PORT, function() {
    console.log("Joining multicast group");
    udpServer.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS)
});

udpServer.on('message', function(msg, source) {
    console.log("Data had arrived: " + msg + ". Source port: " + source.port);

    let recievedMusician = JSON.parse(msg);

    let newMusician = true;
    activeMusicians.forEach(function(activeMusician) {
        if (activeMusician.uuid === recievedMusician.uuid) {
            newMusician = false;
        }
    });

    if (newMusician) {
        addMusician(recievedMusician);
    } else {
        updateMusician(recievedMusician);
    }
});


// =========================================================================
// TCP Server
// =========================================================================
var tcpServer = net.createServer(function(socket) {
    console.log("Recieved connection to TCP listening port!");

    // Makes copy of activeMusicians
    let activeMusiciansForOutput = JSON.parse(JSON.stringify(activeMusicians));

    // Remove non-required attribute from output
    activeMusiciansForOutput.forEach(function(m) {
        delete m.timeoutCounter;
    });

    socket.write(JSON.stringify(activeMusiciansForOutput, undefined, 3));
    socket.pipe(socket);
    socket.destroy();
});

tcpServer.listen(protocol.PROTOCOL_TCP_LISTENING_PORT);


// =========================================================================
// Periodic update
// =========================================================================
setInterval(function() {
    updateActiveMusicians();
}, 1000);


// =========================================================================
// Functions
// =========================================================================
function addMusician(newMusician) {
    console.log("Registered new musician: " + newMusician.uuid);
    let musician = {
        uuid: newMusician.uuid,
        instrument: instrumentSounds.get(newMusician.sound),
        activeSince: new Date(Date.now()).toISOString(),
        timeoutCounter: 0
    };

    activeMusicians.push(musician);
};


function updateMusician(Musician) {
    console.log("Reseting musician timeout counter");
    let musicianToUpdate = activeMusicians.find(m => m.uuid === Musician.uuid);
    musicianToUpdate.timeoutCounter = 0;
};


function updateActiveMusicians() {
    let now = new Date(Date.now());

    for (let i = 0; i < activeMusicians.length; i++) {
        if (activeMusicians[i].timeoutCounter++ > 5) {
            console.log("UUID: " + activeMusicians[i] + " has been unresponsive for over 5 timeoutCounter.");
            activeMusicians.splice(i,1);
            --i;
        }
    }
};