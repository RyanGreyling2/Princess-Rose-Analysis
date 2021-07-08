import {useState, useEffect} from 'react';
import './App.css';

import { Button } from '@material-ui/core';

import red from './Colors/red.png';
import blue from './Colors/blue.png';
import green from './Colors/green.png';
import cyan from './Colors/cyan.png';
import purple from './Colors/purple.png';
import orange from './Colors/orange.png';

// keys of img elements are computed as 'keyhead + color + arr_index'
function RoseArray(count: number, color: string, keyhead: string) {// A row of rose images

  const colorKeyToPNG = function(color: string) {
      switch (color){
          case "red":
            return red
          case "blue":
            return blue
          case "orange":
            return orange
          case "purple":
            return purple;
          case "cyan":
            return cyan;
          case "green":
            return green;
          default:
            throw new Error('Unknown color: ' + color);
        }
    }

  const roseArray = [];
  for (let i = 0; i < count; i++){
    roseArray.push(<img key={keyhead+color+i} src={colorKeyToPNG(color)} alt=""/> )
  }

  return roseArray

}


type BushProps = {
  count: number,
  color: string,
  gameUpdate: (change: number) => void,
  colorsCapped: boolean,
  isClicked: boolean
};
/*
count: current number of roses
color: Color of the roses
gameUpdate: handler to update state in Game
colorsCapped: if 2 colors are in the buffer, then Bush shouldn't let any more roses be picked
isClicked: Whether or not the button should be in a clicked state
*/
function Bush(props: BushProps) {
  const gameUpdate = props.gameUpdate;
  const isClicked = props.isClicked;

  const capitalizeFirst = function(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const colorKeyToPNG = function(color: string) {
    switch (color){
        case "red":
          return red
        case "blue":
          return blue
        case "orange":
          return orange
        case "purple":
          return purple;
        case "cyan":
          return cyan;
        case "green":
          return green;
        default:
          throw new Error('Unknown color: ' + color);
      }
  }

  const roseArray = [];
  for (let i = 0; i < props.count; i++){
    roseArray.push(<img src={colorKeyToPNG(props.color)} alt=""/> )
  }

  return (
    <div className="bush">
      <div className="bush-row1">
        <div className="bush-row1-cell">
          <b>{capitalizeFirst(props.color)}</b>
        </div>
        <div className="bush-row1-cell">
          {RoseArray(props.count, props.color, "state")}
        </div>
      </div>
      {isClicked 
      ? <Button className="rose-button" variant="contained" color="secondary" onClick={() => gameUpdate(1)}>Put Back</Button>
      : props.colorsCapped || props.count === 0
        ? <Button className="rose-button"  variant="outlined" disabled>{props.count === 0 ? "Empty" : "Colors Capped"}</Button>
        : <Button className="rose-button"  variant="contained" color="primary" onClick={() => gameUpdate(-1)}>Pick Rose</Button>
      }
    </div>
  );
}

type RoseCounterProps = {
  count: number,
  color: string,
  setCount: (count: number) => void,
};

function RoseCounter(props: RoseCounterProps) { // Counter used to help setup new games
  const setCount = props.setCount;

  return (
    <>
    <div>{props.color}</div>
    {props.count}
    <button onClick={()=> {if (props.count !== 0) setCount(props.count-1)}}>{"-"}</button>
    <button onClick={()=> {setCount(props.count+1)}}>{"+"}</button>
    </>
  )
}

function GameSetup(props: {init: colorSet, setGameStateSetup: (init: colorSet) => void}) {
  const init = props.init;
  let initKeyArr = Object.keys(init) as Array<keyof colorSet>;

  const [game_setup_cache, setGameSetupCache] = useState(init); // Cache updates to the initial game state

  return (
    <>
    {initKeyArr.map((key) => <RoseCounter key={key + "Setup"} count={game_setup_cache[key]} color={key} 
      setCount={(count) => {
        let new_game_setup_cache = {} as colorSet;
        Object.assign(new_game_setup_cache, game_setup_cache);
        new_game_setup_cache[key] = count;
        setGameSetupCache(new_game_setup_cache);
      }}/>)}
      <Button onClick={() => props.setGameStateSetup(game_setup_cache)}>
        Setup New Game
      </Button>
    </>
  )
}

type colorSet = {
  red: number,
  blue: number,
  green: number,
  purple: number,
  orange: number,
  cyan: number,
};

async function isWinning(game: number[]) { // Returns True if in winning position, false if in losing position
  type cache = { [key: number] : string[] };

  let cache_loss: cache = {}; // Cache of positions known to be losing
  let cache_win: cache = {}; // Cache of large positions known to be winning

  const getCacheIndex = function(game: number[]) {
    return game.reduce((acc, val) => acc+val, 0);
  }

  const inCache = function(game: number[], cache: cache): boolean {
    let cache_index = getCacheIndex(game);
    if (cache.hasOwnProperty(cache_index)) {
      let arr = cache[cache_index];
      if (arr.includes(JSON.stringify(game.sort()))) {
        return true;
      }
    }
    return false;
  }

  const addToCache = function(game: number[], cache: cache): void {
    let cache_index = getCacheIndex(game);
    if (cache.hasOwnProperty(cache_index)) {
      cache[cache_index].push(JSON.stringify(game.sort()));
    } else {
      cache[cache_index] = [JSON.stringify(game.sort())];
    }
  }

  async function isWinning_aux(game: number[], head=true, child=false) {

  if (inCache(game, cache_loss)) return false;
  if (getCacheIndex(game) > 18 && inCache(game, cache_win)) return true;

  if (game.includes(0)) {
    // Game is solved for less than 6 colors
    // See: "The Princess and Some Roses" by Kenjoe Lim

    let new_game = game.filter((count) => count !== 0)
    new_game.sort().reverse();
    if (new_game.length < 5) new_game = new_game.concat(Array(5-new_game.length).fill(0))
    new_game = new_game.map((count) => count % 2);

    switch(JSON.stringify(new_game)) { // The four types of losing positions
      case "[0,0,0,0,0]":
      case "[1,1,1,0,0]":
      case "[0,1,1,1,1]":
      case "[1,0,0,1,1]":
      if (child || head) {
        console.log("Losing Position: 5 colors or less");
        if (child) console.log(game);
      }
      return false;
    }

    return true; // Winning position if not one of the four types
  }

  // Otherwise we perform recursive search
  for (let i=0; i<game.length; i++) {
    if (game[i] <= 0) continue;

    let new_game: number[] = [];
    Object.assign(new_game, game);
    new_game[i] -= 1;

    let result = await isWinning_aux(new_game, false, head);
    if (!result) {
      if (head) console.log("Winning Position");
      if (getCacheIndex(game) > 18) addToCache(game, cache_win);
      return true;
    }
  }

  for (let i=0; i<game.length; i++) {
    for (let j=i+1; j<game.length; j++) {
      if (game[i] <= 0 || game[j] <= 0) continue;

      let new_game: number[] = [];
      Object.assign(new_game, game);
      new_game[i] -= 1;
      new_game[j] -= 1;

      let result = await isWinning_aux(new_game, false, head);
      if (!result) {
        if (head) console.log("Winning Position");
        if (getCacheIndex(game) > 18) addToCache(game, cache_win);
        return true;
      }
    }
  }

  if (child) {
    console.log("Losing Position child found as");
    console.log(game);
  }
  if (head) {
    console.log("Losing Position");
  }

  addToCache(game, cache_loss);
  return false;
  } // End of isWinning_aux

  let result = await isWinning_aux(game);
  console.log(cache_loss);
  console.log(cache_win);
  return result;
}


type colorSetBool = {
  red: boolean,
  blue: boolean,
  green: boolean,
  purple: boolean,
  orange: boolean,
  cyan: boolean,
};

// Main component
function Game() {
let game_state_default: colorSet = {// Game State: Roses remaining on each Bush
  red: 5,
  blue: 5,
  green: 5,
  purple: 5,
  orange: 5,
  cyan: 5,
};
let buffer_init: colorSet = {// Buffer to cache potential changes to Game State
  red: 0,
  blue: 0,
  green: 0,
  purple: 0,
  orange: 0,
  cyan: 0,
};

let button_is_clicked_init: colorSetBool = {// Controls the state of the button in each bush
  red: false,
  blue: false,
  green: false,
  purple: false,
  orange: false,
  cyan: false,
};

const [game_state_init, setGameStateSetup] = useState(game_state_default);
const [game_state, setGameState] = useState(game_state_init);
const [game_buffer, setGameBuffer] = useState(buffer_init); // buffer to cache potential moves
const [game_history, setGameHistory] = useState([game_state_init]); // history containing move history
const [game_history_index, setGameHistoryIndex] = useState(0); // current index into game_history

const [button_is_clicked, setButtonIsClicked] = useState(button_is_clicked_init);
const [curr_player, setCurrPlayer] = useState(true);
const [colorsCapped, setColorsCapped] = useState(false); // whether or not a player has already picked 2 colors for their move
const [gameOver, setGameOver] = useState(false); // whether or not the game is over

useEffect(() => { // handles changes to game_state_init
  setGameHistory([game_state_init]);
  setGameHistoryIndex(0);
}, [game_state_init])

useEffect(() => { // handle changes to game_history_index
  // update game_state
  setGameState(game_history[game_history_index]);

  // cleanup
  setGameBuffer(buffer_init);
  setCurrPlayer(game_history_index % 2 === 0);
  setColorsCapped(false);
  setButtonIsClicked(button_is_clicked_init);

  let remaining_roses = Object.values(game_state).reduce((acc,val) => acc+=val, 0);
  if (remaining_roses === 0) setGameOver(true);
}, [game_history_index, game_history]);

let stateKeyArr  = Object.keys(game_state) as Array<keyof colorSet>;
let bufferKeyArr = Object.keys(game_buffer) as Array<keyof colorSet>;

const pickedRoses = bufferKeyArr.map((key) => RoseArray(game_buffer[key], key, "picked")).flat();

return (
  <>
    <h1>Princess and Roses Game</h1>
    <div className="flexbox-bushes">{stateKeyArr.map((key) => 
      <Bush key={key} color={key} count={game_state[key]} colorsCapped={colorsCapped} isClicked={button_is_clicked[key]}
        gameUpdate={(change) => { 
              // New game state
              let new_game_state = {} as colorSet;
              Object.assign(new_game_state, game_state);
              new_game_state[key] += change;
              setGameState(new_game_state);

              // New game buffer
              let new_game_buffer = {} as colorSet;
              Object.assign(new_game_buffer, game_buffer);
              new_game_buffer[key] -= change;
              setGameBuffer(new_game_buffer);

              // Check if number of picked colors capped (max 2)
              let offset_amount = Object.values(new_game_buffer).reduce((acc,val) => acc+=val, 0);
              if (offset_amount >= 2) {
                setColorsCapped(true);
              } else {
                setColorsCapped(false);
              }

              // Update button_is_clicked
              let new_button_is_clicked = {} as colorSetBool;
              Object.assign(new_button_is_clicked, button_is_clicked);
              if (change > 0) {
                new_button_is_clicked[key] = false;
              } else {
                new_button_is_clicked[key] = true;
              }
              setButtonIsClicked(new_button_is_clicked);
        }}
       />)
    }</div>

    <div id="between-main-picked">&nbsp;</div>
    <div><b>Picked Roses:</b></div>
      <div className="picked-rose-arr">{pickedRoses}</div>
    <br/>

    <div className="update">
      <Button className="update-button" variant="outlined" onClick={() => {
              // Add current game_state to history and increment index
              let new_index = game_history_index + 1;
              setGameHistory([...game_history.slice(0, new_index), game_state]);
              setGameHistoryIndex(new_index);
        }}>
        Update State
      </Button>
      <div>{ gameOver
        ? `Game over. Winner is player ${curr_player ? 2 : 1}`
        : `Current Player is ${curr_player ? 1 : 2}`
      }</div>
    </div>
    <br/>
    <div className="rules"> <strong>How to Play:</strong> On your move you can either 
      <ol>
        <li>Take one rose of any color</li> 
        <li>Take two roses of differing colors</li>
      </ol>
      The Winner is the player who takes the final rose. 
    </div>
    {game_history_index !== 0 ?
      <Button onClick={() => setGameHistoryIndex(game_history_index - 1)}>
        Previous Move
      </Button>
    :  <Button disabled>
        Previous Move
      </Button>}
    {game_history_index !== game_history.length-1 ?
      <Button onClick={() => setGameHistoryIndex(game_history_index + 1)}>
        Next Move
      </Button>
    : <Button disabled>
        Next Move
      </Button>}
      <GameSetup init={game_state_init} setGameStateSetup={setGameStateSetup}/>
      <button onClick={() => {console.log("Beginning Analysis"); isWinning(Object.values(game_state))}}>Analyze Current Position</button>
  </>
)

}


function App() {
  return (
    <div className="App">
      {<Game />}
    </div>
  );
}

export default App;
