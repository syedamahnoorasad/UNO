// export function game_start(socket, io, players, GameSession, sockets)
// {
  
//     //   useEffect(() => {
//         socket.on('signal-to-begin',() =>
//         {
//             io.emit("proceed-to-game","")
//             console.log('sending message to all clients to load game')
//             console.log(socket.id)
//             initializeGame(players,GameSession)
//             // console.log(GameSession)
//             // console.log(players[0].hand)
//             // console.log(GameSession.deck.length)
//     //         return () => socket.off("proceed-to-game","");
//           for( let x = 0; x<4; x++)
//           { 
//             console.log("sending hand to ", GameSession.players[x].socket.id)
//             io.to(GameSession.players[x].socket.id).emit('hand', GameSession.players[x].hand);
//             io.to(GameSession.players[x].socket.id).emit('discardPile', GameSession.discardPile[GameSession.discardPile.length - 1]);
//             // console.log('discardPile', GameSession.discardPile[GameSession.discardPile.length - 1])
//             io.to(GameSession.players[x].socket.id).emit('deckTop', GameSession.deck[GameSession.deck.length - 1]);
//             io.to(GameSession.players[x].socket.id).emit('yourName', [GameSession.players[x].name]);
//             let otherPlayers:string[] = []
//             for( let i = 0; i<4; i++)
//             {
//               if( GameSession.players[i].name!== GameSession.players[x].name)
//               {
//                 otherPlayers.push(GameSession.players[i].name)
//               }
//             }
//             io.to(GameSession.players[x].socket.id).emit('otherPlayerNames', otherPlayers);

//             io.to(players[x].socket.id).emit('username', players[x].name);
//           }
//           let string_x:string = "Take your turn, " + players[0].name + "!";
//           io.emit('first-person', string_x);
//         })


//         }

// // GameSession.deck.push(`card num-${number} ${color}`);
// // if (number !== 0) {
// //     GameSession.deck.push(`card num-${number} ${color}`);
// // }
// // }
// // for (const action of actions) {
// //     GameSession.deck.push(`card ${action} ${color}`);
// //     GameSession.deck.push(`card ${action} ${color}`);
// // }
// // GameSession.deck.push(`card ${wilds[1]}`);

// export function initializeGame(players, GameSession) {

//     GameSession.deck = [];
//     const colors:string[] = ["red", "blue", "green", "yellow"];
//     const numbers: number[] = Array.from({ length: 10 }, (_, i) => i);
//     const actions:string[]  = ["S", "R", "D2"];
//     const wilds:string[]  = ["wild", "D4"];
//     for (const col of colors) {
//         for (const number of numbers) {
//             GameSession.deck.push({value: (String(number)), color: col});
//         if (number !== 0) {
//             GameSession.deck.push({value: (String(number)), color: col});
//         }
//         }
//         for (const action of actions) {
//             GameSession.deck.push({value: action, color: col});
//             GameSession.deck.push({value: action, color: col});
//         }
//         GameSession.deck.push({value:  wilds[1], color: wilds[0]});
//     }
//     for (let i = GameSession.deck.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [GameSession.deck[i], GameSession.deck[j]] = [GameSession.deck[j], GameSession.deck[i]];
//     }


//     // Deal 7 cards to each player
//     for (const player of players) {
//         player.hand = Array.from({length: 7}, () => GameSession.deck.pop());
//     }

//     GameSession.discardPile.push(GameSession.deck.pop());

//         GameSession.currentPlayer= 0
//         GameSession.direction =  1
//         GameSession.players = players
// }


// Clean UNO deck builder
interface Card {
  value: string;
  color: string | null;
}

function buildDeck() {
  const deck: Card[] = [];
  const colors = ["red", "blue", "green", "yellow"];
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
  const actions = ["S", "R", "D2"];

  // Colored cards
  for (const col of colors) {
    // One 0 per color
    deck.push({ value: "0", color: col });
    // Two 1–9 per color
    for (let i = 1; i <= 9; i++) {
      deck.push({ value: i.toString(), color: col });
      deck.push({ value: i.toString(), color: col });
    }
    // Two action cards each per color
    for (const action of actions) {
      deck.push({ value: action, color: col });
      deck.push({ value: action, color: col });
    }
  }

  // Wild cards (no color)
  for (let i = 0; i < 4; i++) {
    deck.push({ value: "WILD", color: null });
    deck.push({ value: "D4", color: null });
  }

  return deck;
}

const WILD_VALUES = new Set(["WILD", "D4"]);


// export function initializeGame(players, GameSession) {
//   GameSession.deck = buildDeck();
//   console.log("Deck built:", GameSession.deck.length, "cards");

//   // Shuffle
//   for (let i = GameSession.deck.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [GameSession.deck[i], GameSession.deck[j]] = [GameSession.deck[j], GameSession.deck[i]];
//   }
//   console.log("Deck shuffled");

//   // Reset hands
//   for (const player of players) {
//     player.hand = [];
//   }

//   // Deal 7 cards each
//   for (const player of players) {
//     for (let i = 0; i < 7; i++) {
//       player.hand.push(GameSession.deck.pop());
//     }
//     console.log(`${player.name} hand:`, player.hand);
//   }

//   // Pick first discard card
//   let firstCard = GameSession.deck.pop();
//   while (firstCard.value === "WILD" || firstCard.value === "D4") {
//     GameSession.deck.unshift(firstCard);
//     firstCard = GameSession.deck.pop();
//   }
//   GameSession.discardPile = [firstCard];
//   console.log("First discard:", firstCard);

//   GameSession.currentPlayer = 0;
//   GameSession.direction = 1;
//   GameSession.players = players;
//   GameSession.winner = "";
//   GameSession.gameOver = false;

//   console.log("Game initialized. Deck left:", GameSession.deck.length);
// }

function effectiveColor(topCard: Card, GameSession): string | null {
  if (topCard.color) {
    return topCard.color;
  }

  if (WILD_VALUES.has(topCard.value)) {
    return GameSession.chosencolor || null;
  }

  return null;
}

function ensureChosenColor(chosenColor: string | undefined): string {
  if (!chosenColor) {
    throw new Error("Chosen color is required for wild cards");
  }

  const normalized = chosenColor.toLowerCase();
  const allowed = ["red", "blue", "green", "yellow"];

  if (!allowed.includes(normalized)) {
    throw new Error("Invalid chosen color");
  }

  return normalized;
}

function stepForward(GameSession, steps = 1) {
  let index = GameSession.currentPlayer;

  for (let i = 0; i < steps; i++) {
    index = getNextPlayerIndex(index, GameSession.direction, GameSession.players.length);
  }

  GameSession.currentPlayer = index;
}

function playWildDraw4(players, GameSession, chosenColor, topCard): number {
  const declaredColor = ensureChosenColor(chosenColor);

  const nextPlayerIndex = getNextPlayerIndex(
    GameSession.currentPlayer,
    GameSession.direction,
    players.length
  );

  for (let i = 0; i < 4; i++) {
    const drawn = GameSession.deck.pop();
    if (drawn) {
      players[nextPlayerIndex].hand.push(drawn);
    }
  }

  GameSession.chosencolor = declaredColor;

  return nextPlayerIndex;
}


export function initializeGame(players, GameSession) {
  GameSession.deck = buildDeck();
  console.log("Deck built:", GameSession.deck.length, "cards");

  // Shuffle
  for (let i = GameSession.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [GameSession.deck[i], GameSession.deck[j]] = [GameSession.deck[j], GameSession.deck[i]];
  }
  console.log("Deck shuffled");

  // Reset hands
  for (const player of players) {
    player.hand = [];
  }

  // Deal 7 cards each
  for (const player of players) {
    for (let i = 0; i < 7; i++) {
      player.hand.push(GameSession.deck.pop());
    }
    console.log(`${player.name} hand:`, player.hand);
  }

  // After dealing hands…
  let firstCard = GameSession.deck.pop();

  // Reshuffle until the first discard is valid
  while (firstCard && WILD_VALUES.has(firstCard.value)) {
    console.log("First card was a wild → reshuffling...");
    GameSession.deck.unshift(firstCard); // put it back
    // shuffle again
    for (let i = GameSession.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [GameSession.deck[i], GameSession.deck[j]] = [GameSession.deck[j], GameSession.deck[i]];
    }
    firstCard = GameSession.deck.pop();
  }

  if (firstCard) {
    GameSession.discardPile.push(firstCard);
    GameSession.chosencolor = firstCard.color || null;
    console.log("First discard:", firstCard);
  }


  // Set turn and direction
  GameSession.currentPlayer = 0;
  GameSession.direction = 1;
  GameSession.players = players;
  GameSession.gameOver = false;
  GameSession.winner = "";

  console.log("Game initialized. Deck left:", GameSession.deck.length);
}



let gameStarted = false;

export function game_start(socket, io, players, GameSession, sockets) {
  if (gameStarted) return; // don’t attach again

  socket.on("signal-to-begin", () => {
    if (gameStarted) return; // prevent multiple runs
    gameStarted = true;

    console.log("Game starting from socket:", socket.id);

    initializeGame(players, GameSession);

    io.emit("proceed-to-game", "");

    for (const p of players) {
      io.to(p.socket.id).emit("hand", p.hand);
      io.to(p.socket.id).emit("yourName", p.name);
    }

    io.emit("discardPile", GameSession.discardPile.at(-1));
    io.emit("deckCount", GameSession.deck.length);

    io.emit("turn", `Take your turn, ${players[GameSession.currentPlayer].name}!`);
  });
}



function advanceTurn(io, GameSession, players) {
  const currentPlayer = GameSession.players[GameSession.currentPlayer];
  io.emit("turn", `It's ${currentPlayer.name}'s turn`);
}

export function playCard(
  io,
  players,
  cardIndex,
  GameSession,
  chosenColor
): boolean {
  if (GameSession.gameOver) {
    return false;
  }

  const currentPlayer = GameSession.players[GameSession.currentPlayer];
  const card = currentPlayer.hand[cardIndex];
  const topCard: Card | undefined = GameSession.discardPile.at(-1);

  if (!card || !topCard) {
    return false;
  }

  if (!canPlayCard(card, topCard, GameSession)) {
    return false;
  }

  let broadcastColor: string | null = null;

  if (card.value === "D4") {
    try {
      playWildDraw4(players, GameSession, chosenColor, topCard);
      broadcastColor = GameSession.chosencolor || null;
    } catch (err) {
      return false;
    }
  }

  if (card.value === "WILD") {
    try {
      const declaredColor = ensureChosenColor(chosenColor);
      GameSession.chosencolor = declaredColor;
      broadcastColor = declaredColor;
    } catch (err) {
      return false;
    }
  }

  // Remove the card from the hand and place onto discard
  currentPlayer.hand.splice(cardIndex, 1);
  GameSession.discardPile.push(card);

  let steps = 1;

  switch (card.value) {
    case "S": {
      steps = 2;
      break;
    }

    case "R": {
      reverseDirection(GameSession);
      steps = players.length === 2 ? 2 : 1;
      break;
    }

    case "D2": {
      drawTwo(players, GameSession);
      steps = 2;
      break;
    }

    case "WILD": {
      steps = 1;
      break;
    }

    case "D4": {
      steps = 2;
      break;
    }

    default: {
      GameSession.chosencolor = card.color || null;
      steps = 1;
      break;
    }
  }

  if (card.value !== "WILD" && card.value !== "D4") {
    GameSession.chosencolor = card.color || null;
  }

  if (broadcastColor) {
    io.emit("color-picked", {
      player: currentPlayer.name,
      color: broadcastColor,
    });
  }

  if (currentPlayer.hand.length === 0) {
    GameSession.gameOver = true;
    GameSession.winner = currentPlayer.name;
    io.emit("winner", `${currentPlayer.name} has won the game`);
    io.emit("uno", { winner: currentPlayer.name });
    return true;
  }

  stepForward(GameSession, steps);

  for (const p of players) {
    if (p.socket?.id) {
      io.to(p.socket.id).emit("hand", p.hand);
    }
  }

  io.emit("discardPile", GameSession.discardPile.at(-1));
  io.emit("deckCount", GameSession.deck.length);

  advanceTurn(io, GameSession, players);

  return true;
}




function canPlayCard(card: Card, topCard: Card, GameSession): boolean {
  if (WILD_VALUES.has(card.value)) {
    return true;
  }

  const colorInPlay = effectiveColor(topCard, GameSession);

  if (colorInPlay && card.color === colorInPlay) {
    return true;
  }

  return card.value === topCard.value;
}
  
export function reverseDirection(GameSession) {
    GameSession.direction *= -1;;
}


export function skipTurn(GameSession){
    stepForward(GameSession, 2);
}


export function drawTwo(players, GameSession) {
  const nextPlayerIndex = getNextPlayerIndex(
    GameSession.currentPlayer,
    GameSession.direction,
    players.length
  );

  for (let i = 0; i < 2; i++) {
    const card = GameSession.deck.pop();
    if (card) {
      players[nextPlayerIndex].hand.push(card);
    }
  }
}


function getNextPlayerIndex(currentPlayerIndex: number, direction: number, numPlayers: number): number {
    let nextPlayerIndex = currentPlayerIndex + direction;
    if (nextPlayerIndex < 0) {
      nextPlayerIndex = numPlayers - 1;
    } else if (nextPlayerIndex >= numPlayers) {
      nextPlayerIndex = 0;
    }
    return nextPlayerIndex;
  }

  ///////check for UNO after playcard 
  export function checkForUno(players, GameSession, io, socket): boolean {
    const currentPlayer = GameSession.currentPlayer
    const numCards = GameSession.players[GameSession.currentPlayer].hand.length;
    if (numCards === 1 && !currentPlayer.calledUno) {
      io.to(players[currentPlayer].socket.id).emit('message', 'Don\'t forget to say "Uno"!','');
          GameSession.winner = GameSession.players[currentPlayer].name;
          return true;
    }   
     GameSession.currentPlayer = getNextPlayerIndex(GameSession.currentPlayer, GameSession.direction, GameSession.players.length);

    return false;
  }

  export function checkDeck(GameSession, io, socket): boolean {
    if (GameSession.deck.length === 0) {
      GameSession.winner = GameSession.players[GameSession.currentPlayer].name;
      return true;
    }
    return false;
  }

export function pass(io, GameSession, players) {
  const currentPlayerIndex = GameSession.currentPlayer;
  const currentPlayer = GameSession.players[currentPlayerIndex];

  // Draw 1 card
  const drawnCard = GameSession.deck.pop();
  if (drawnCard) {
    currentPlayer.hand.push(drawnCard);
  }

  // Advance to next player
  GameSession.currentPlayer = getNextPlayerIndex(
    currentPlayerIndex,
    GameSession.direction,
    players.length
  );

  // Update all clients
  for (const p of players) {
    io.to(p.socket.id).emit("hand", p.hand);
  }
  io.emit("discardPile", GameSession.discardPile.at(-1));
  io.emit("deckCount", GameSession.deck.length);

  // Announce whose turn it is
  io.emit("turn", `It's ${players[GameSession.currentPlayer].name}'s turn`);
}

export function resetGameSession(GameSession, players) {
  gameStarted = false;
  GameSession.deck = [];
  GameSession.discardPile = [];
  GameSession.currentPlayer = 0;
  GameSession.direction = 1;
  GameSession.chosencolor = "";
  GameSession.winner = "";
  GameSession.gameOver = false;

  for (const player of players) {
    player.hand = [];
    player.name = "";
  }
}


  // export function endGame(GameSession) {
  //   for (let i = 0; i < GameSession.players.length; i++) {
  //     if (GameSession.players[i].hand.length === 0) {
  //       GameSession.winner = GameSession.players[i].name;
  //       GameSession.gameOver = true;
  //       return true;
  //     }
  //   }
    
  //   return false; 
  // }
  
  

  
  

