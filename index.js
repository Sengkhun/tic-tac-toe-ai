var network = require( 'net' );
var client = new network.Socket();

var HOST = '172.20.10.3';
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

    client.setEncoding( 'utf8' );
    client.write( 'Sengkhun Sokhavirith and Utdorm are ready\n' );
    console.log( 'Connected' );

});

client.on( 'data', function( data ) {

    var respond = data.toString();

    switch ( respond.length ) {

        case 1:

            if ( respond === "-1" ) {

                // Game Over, Terminated
                client.destroy();

            } else if ( respond[0] === 'x' || respond[0] === 'o' ) {

                // Assignment Identity
                me = respond[0];
                opponent = compare( me, 'x' ) ? 'o' : 'x';
                client.write( "1\n" );
                console.log( "I am " + me );

            }
            break;

        // Apply Minimax Algorithm
        default:

            // Our Turn
            if ( respond[0] === me ) {

                var dataStr = data.toString();
                var boardStr = dataStr.substring( 3, dataStr.length );

                var borad = [];
                for (var i = 0; i < boardStr.length; i++) {
                    if ( boardStr[i] !== ',' && boardStr[i] !== '\u0000' ) {
                        borad.push( boardStr.charAt(i) );
                    }
                }

                // Convert to origBoard formart
                for ( var i = 0; i < borad.length; i++ ) {
                    borad[i] = borad[i] == 0 ? i : borad[i];
                }
                console.log(borad);
                origBoard = borad;
                result = convertToIndex( minimax( origBoard, me ).index );
                console.log(result);
                client.write( result + "\n" );

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
