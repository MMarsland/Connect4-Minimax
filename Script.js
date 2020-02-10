    // bOARD IS grouped by column
    let gameBoard = "000000000000000000000000000000000000000000";
    let currentPlayer = 1;
    let userGameStats = {
      userPlaying: true,
      usersTurn: true,
      round: 0,
      winner: null,
    }
    let highlightedColumn;

    // UI functions
    function onload() {
      buildBoard();
    }

    function buildBoard() {
      const playArea = document.getElementById("playArea");
      playArea.innerHTML = "";
      let col, square;
      for (let squareNum=0; squareNum<42; squareNum++) {
        square = document.createElement('div');
        square.classList.add("square");
        square.setAttribute("id", squareNum);
        square.setAttribute('onclick', 'columnClicked('+(Math.floor(squareNum/6))+')');
        square.setAttribute('onmouseover', 'highlightColumn('+(Math.floor(squareNum/6))+', true)');
        square.setAttribute('onmouseout', 'highlightColumn(null, true)');
        playArea.appendChild(square);
      }
    }

    function updateView(board) {
      for (let squareNum=0;squareNum<42;squareNum++) {
        if(board[squareNum] == 1) {
          document.getElementById(squareNum).classList.add("blue");
        } else if (board[squareNum] == 2) {
          document.getElementById(squareNum).classList.add("yellow");
        } else if (board[squareNum] == 0) {
          document.getElementById(squareNum).classList.remove("blue", "yellow");
        }
      }
      document.getElementById("nextTurn").innerHTML = "Next Player: "+(currentPlayer==1?"Blue":"Yellow");
    }

    function updateViewToGameBoard() {
      updateView(gameBoard);
    }

    function consoleLogBoard(board) {
      // Rotate the board!
      let boardToLog = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
      for (let col=0;col<7;col++) {
        for (let row=0; row<6; row++) {
          boardToLog[row][col] = board[(col*7 + row)];
        }
      }
      console.log(boardToLog);
    }

    function highlightColumn(colNum, track) {
      if (track) {
        highlightedColumn = colNum;
      }

      const playArea = document.getElementById("playArea");
      for (square of playArea.children) {
        if ((Math.floor(square.getAttribute("id") / 6 )) == colNum) {
          if (userGameStats.usersTurn) {
            square.classList.add("highlighted");
          } else {
            square.classList.remove("highlighted");
          }
        } else {
          square.classList.remove("highlighted");
        }
      }
    }
    // END

    // Helper Functions
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getRandInt(min, max) {
        let realMax = max+1;
        let random = (Math.floor(Math.random() * (realMax-min)) + min);
        return random;
    }

    function getIndexesOfMaxima(array) {
      let max = Math.max(...array);
      let indexes = [];
      for (i=0;i<array.length;i++) {
        if (array[i] == max) {
          indexes.push(i);
        }
      }
      return indexes;
    }
    // END

    // INPUT FUNCTIONS
    function playAgainstAI() {
      reset();
      updateThinking(0);
      updateViewToGameBoard();
      userGameStats = {
        userPlaying: true,
        usersTurn: true,
        round: 0,
        winner: null,
      }
    }


    async function columnClicked(colNum) {
      //FOLD
      if (!userGameStats.userPlaying || !userGameStats.usersTurn || columnFull(gameBoard, colNum)) {return;}
      userGameStats.usersTurn = false;
      highlightColumn(null, false);
      updateThinking(1);
      userGameStats.round++;

      gameBoard = placeInBoard(gameBoard, colNum, currentPlayer);
      currentPlayer = currentPlayer%2+1;

      updateViewToGameBoard();

      //TrainPlayer2
      //if (userGameStats.round > 1) {
      //    update(player2, player2State, player2StateRewards, player2ChosenAction, gameBoard);
      //}

      userGameStats.winner = checkForWin(gameBoard);
      if (userGameStats.winner != null) {
        userGameStats.userPlaying = false;
        console.log("Game Over");
        document.getElementById("nextTurn").innerHTML = userGameStats.winner==1?"Winner: Blue!":(userGameStats.winner == 2? "Winner: Yellow!": "Tie Game!");
        updateThinking(0);
        return;
      }

      await sleep(1);
      // AI MOVE
      let action = await getActionByMinimax(currentPlayer, gameBoard, 8);
      gameBoard = placeInBoard(gameBoard, action, currentPlayer);
      currentPlayer = currentPlayer % 2 + 1;
      updateViewToGameBoard();
      userGameStats.winner = checkForWin(gameBoard);
      if (userGameStats.winner != null) {
        userGameStats.userPlaying = false;
        console.log("Game Over");
        document.getElementById("nextTurn").innerHTML = userGameStats.winner==1?"Winner: Blue!":(userGameStats.winner == 2? "Winner: Yellow!": "Tie Game!");
        updateThinking(0);
        return;
      }
      userGameStats.usersTurn = true;
      highlightColumn(highlightedColumn, true);
      updateThinking(0);
    }

    let thinkingState = 0;
    function updateThinking(state) {
      thinkingState = (thinkingState % 3) + 1;
      if (state != undefined) {
        thinkingState = state;
      }
      let thinkingArea = document.getElementById("thinkingArea");
      if (thinkingState == 0) {
        thinkingArea.innerHTML = "";
      } else if (thinkingState == 1) {
        thinkingArea.innerHTML = "Thinking.";
      } else if (thinkingState == 2) {
        thinkingArea.innerHTML = "Thinking..";
      } else if (thinkingState == 3) {
        thinkingArea.innerHTML = "Thinking...";
      }
    }
    //END





    // GAME FUNCTIONS

    //Resets the GAME
    function reset() {
      currentPlayer = 1;
      gameBoard = "000000000000000000000000000000000000000000";
    }

    // Returns new board
    function placeInBoard(board, colNum, player) {
      // FOLD
      newBoard = board.substring(0, colNum*6) + placeInColumn(board, colNum, player) + board.substring(colNum*6+6);
      return newBoard;
    }

    // PRIVATE returns new column
    function placeInColumn(board, colNum, player) {
      let column = board.substring(colNum*6, colNum*6+6);
      for(let square=5; square>=0; square--) {
        if (column[square] == 0) {
          newColumn = column.substring(0, square) + player + column.substring(square + 1);
          return newColumn;
        }
      }
    }

    // returns boolean
    function columnFull(board, colNum) {
      // FOLD
      let column = board.substring(colNum*6, colNum*6+6);
      for(let square=5; square>=0; square--) {
        if (column[square] == 0) {
          return false;
        }
      }
      return true;
    }

    function boardFull(board) {
      for (let row=0; row<6; row++) {
        if (board[row] == 0 || board[row+1*6] == 0 || board[row+2*6] == 0 || board[row+3*6] == 0 || board[row+4*6] == 0 || board[row+5*6] == 0 || board[row+6*6] == 0) {
          return false;
        }
      }
      return true;
    }

    function checkForWin(board) {
      // FOLD
      if (boardFull(board)) {
        return 3;
      }
      let winner = null;
      for (let squareNum=0; squareNum<42; squareNum++) {
        if (board[squareNum] != 0) {
          if (Math.floor(squareNum / 6) > 2) {
            //l
            if (board[squareNum] == board[squareNum-6] && board[squareNum] == board[squareNum-12] && board[squareNum] == board[squareNum-18]) {
              return board[squareNum];
            }
          }
          //up
          if (squareNum%6 > 2) {
            //ul
            if (Math.floor(squareNum / 6) > 2) {
              if (board[squareNum] == board[squareNum-7] && board[squareNum] == board[squareNum-14] && board[squareNum] == board[squareNum-21]) {
                return board[squareNum];
              }
            }
            //u
            if (board[squareNum] == board[squareNum-1] && board[squareNum] == board[squareNum-2] && board[squareNum] == board[squareNum-3]) {
              return board[squareNum];
            }
            //ur
            if (Math.floor(squareNum / 6) < 4) {
              if (board[squareNum] == board[squareNum+5] && board[squareNum] == board[squareNum+10] && board[squareNum] == board[squareNum+15]) {
                return board[squareNum];
              }
            }
          }

        }
      }
      return null;
    }
    //END
