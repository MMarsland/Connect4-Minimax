// MINIMAX FUNCTIONS
async function getActionByMinimax(player, state, depth) {
  callCount=0;
  let results = [];
  let result;
  for (let colNum=0; colNum<7; colNum++) {
    if (columnFull(gameBoard, colNum)) { results.push(-1000); continue; };
    result = await minimax(player, placeInBoard(gameBoard, colNum, player), depth, -Infinity, Infinity, false);
    results.push(result);
  }
  //console.log(results);
  let action = getRandomMax(results);
  return action;
}

function getScoreForPosition(board, winner, player, depthRemaining) {
  if (!winner) {
    winner = checkForWin(board);
  }

  if ((winner == 1 && player == 1) || (winner == 2 && player == 2)) {
    //console.log("win!")
    return 10 * (depthRemaining+1);
  } else if ((winner == 1 && player == 2) || (winner == 2 && player == 1)) {
    //console.log("Loss")
    return -10 * (depthRemaining+1);
  } else if (winner == 3) {
    //console.log("tie");
    return 1;
  } else {
    //console.log("other");
    // OTHER POSITION EVALUATION METHOD
    return -1;
  }
}

async function minimax(player, position, depth, alpha, beta, maximizingPlayer) {
  callCount++;
  if (callCount % 10000 == 0) {
    if (callCount % 100000 == 0) {
      updateThinking();
    }
    await sleep(1);
  }
  let minEval, eval, maxEval;
  // KEY FUNCTION
  let winner = checkForWin(position);

  if (depth == 0 || winner != null) {
    return getScoreForPosition(position, winner, player, depth);
  }

  if (maximizingPlayer) {
    maxEval = -Infinity;
    for (let colNum=0; colNum<7; colNum++) {

      // KEY FUNCTION
      if (columnFull(position, colNum)) {
        continue;
      } else {

        // KEY FUNCTION
        temp = await minimax(player, placeInBoard(position, colNum, player), depth - 1, alpha, beta, false);


        eval = temp;
      }
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    minEval = Infinity;
    for (let colNum=0; colNum<7; colNum++) {

      // KEY FUNCTION
      if (columnFull(position, colNum)) {
        continue;
      } else {

        // KEY FUNCTION
        temp = await minimax(player, placeInBoard(position, colNum, player%2+1), depth - 1, alpha, beta, true);


        eval = temp;
      }
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}





// DONE
function getRandomMax(results) {
  let max = Math.max(...results);
  let maximaMoves = [];
  for (let i=0; i<results.length;i++) {
    if (results[i] == max) {
      maximaMoves.push(i);
    }
  }
  return maximaMoves[getRandInt(0, maximaMoves.length-1)];
}
let callCount = 0;
async function testMinimax() {
  callCount = 0;
  console.log("Starting");
  let results = [];
  let result;
  for (let colNum=0; colNum<7; colNum++) {
    if (columnFull(gameBoard, colNum)) { results.push(-1000); continue; };
    result = await minimax(currentPlayer, placeInBoard(gameBoard, colNum, currentPlayer), 8, -Infinity, Infinity, false);
    results.push(result);
  }
  console.log(results);
  let action = getRandomMax(results);
  console.log("The best move is square: "+ action);
}
// END
