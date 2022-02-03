// =========================================================================
// Imports
// =========================================================================
var protocol = require( './UDP-orchestra-protocol');
var dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');
const internal = require('stream');

// =========================================================================
// Create UDP socket
// =========================================================================
var s = dgram.createSocket('udp4');

// =========================================================================
// Mapping intruments to sound
// =========================================================================
var instrumentSounds = new Map();
instrumentSounds.set('piano', 'ti-ta-ti');
instrumentSounds.set('trumpet', 'pouet');
instrumentSounds.set('flute', 'trulu');
instrumentSounds.set('violin', 'gzi-gzi');
instrumentSounds.set('drum', 'boum-boum');

// =========================================================================
// Musician js class accepting a instrument parameter
// =========================================================================
function Musician(instrument) {
    this.uuid = uuidv4();
    this.instrument = instrument;

    // =======================
    // Class play method
    // =======================
    Musician.prototype.play = function() {

        // get payload data
        var payloadData = {
            uuid: this.uuid,
            sound: instrumentSounds.get(this.instrument)
        };

        // load payload datat onto payload
        var payload = JSON.stringify(payloadData);

        // load payload onto a buffer
        let message = new Buffer(payload);

        // Send payload as UDP datagram
        s.send(message, 0, message.length, protocol.PROTOCOL_MULTICAST_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
        });
    }

    // Musician plays his instrument every 1 second
    setInterval(this.play.bind(this), 1000);
}

// Get istrument from command line attribute
var instrument = process.argv[2];

// Create a new musician (playingwillbe initiated by constructor)
var m1 = new Musician(instrument);