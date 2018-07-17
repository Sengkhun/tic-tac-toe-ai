var network = require( 'net' );
var client = new network.Socket();

var HOST = '172.20.10.4';
var PORT = 5000;

// Initial Board and player
var origBoard = '';
var me = 'x';
var opponent = 'o';
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];

client.connect( PORT, HOST, function() {

    console.log( 'Connected' );
    client.setEncoding( 'utf8' );
    client.write( 'Client: Ready\n' );

});

client.on( 'data', function( data ) {

    const respond = data.toString().split( "," );

    switch ( respond.length ) {

        case 1:

            if ( compare( respond[0], "-1" ) ) {

                // Game Over, Terminated
                client.destroy();

            } else {
                // Assignment Identity
                me = respond[0];
                opponent = compare( me, 'x' ) ? 'o' : 'x';
            }
            break;

        // Apply Minimax Algorithm
        case 10:

            // Our Turn
            if ( compare( respond[0], me ) ) {

                // Delete the first element
                respond.shift();

                // Convert to origBoard formart
                for ( var i = 0; i < respond.length; i++ ) {
                    respond[i] = respond[i] == 0 ? i : respond[i];
                }

                origBoard = respond;
                result = convertToIndex( minimax( origBoard, me ).index );
                client.write( `${result}\n` );

            }
            break;
    }

});

client.on( 'close', function() {
    console.log( 'Client: connection closed' );
});

client.on( 'error', function( error ) {
    console.log( 'no connection found!' );
    console.log( error );
});

function convertToIndex( index ) {

    let result = "";
    result += parseInt( index / 3 ); // Row
    result += parseInt( index % 3 ); // Coloum

    return result;

}

function emptySquares() {
    return origBoard.filter( s => typeof s == "number" );
}

function checkWin( board, player ) {

    let plays = board.reduce(
        ( a, e, i ) => ( e === player )
        ? a.concat( i )
        : a,
    []);

    let gameWon = null;
    for ( let [ index, win ] of winCombos.entries() ) {
        if ( win.every( elem => plays.indexOf( elem ) > -1 ) ) {
            gameWon = { index: index, player: player };
            break;
        }
    }

    return gameWon;

}

function minimax( newBoard, player ) {

    var availSpots = emptySquares();

    if ( checkWin( newBoard, me ) ) return { score: -10 };
    else if ( checkWin( newBoard, opponent) ) return { score: 10 };
    else if ( availSpots.length === 0 ) return { score: 0 };

    var moves = [];
    for ( var i = 0; i < availSpots.length; i++ ) {

        var move = {};
        move.index = newBoard[ availSpots[ i ] ];
        newBoard[ availSpots[ i ] ] = player;

        if ( player == opponent ) {

            var result = minimax( newBoard, me );
            move.score = result.score;

        } else {

            var result = minimax( newBoard, opponent );
            move.score = result.score;

        }

        newBoard[ availSpots[ i ] ] = move.index;
        moves.push( move );

    }

    var bestMove;
    if ( player === opponent ) {

        var bestScore = -10000;
        for ( var i = 0; i < moves.length; i++ ) {
            if ( moves[i].score > bestScore ) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }

    } else {

        var bestScore = 10000;
        for ( var i = 0; i < moves.length; i++ ) {
            if ( moves[i].score < bestScore ) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }

    }

    return moves[ bestMove ];

}

function compare( str1, str2 ) {
    return str1.localeCompare( str2 ) == 0;
}
