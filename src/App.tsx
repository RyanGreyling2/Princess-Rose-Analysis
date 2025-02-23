import {useState, useEffect} from 'react';
import './App.css';

import red from './Colors/red.png';
import blue from './Colors/blue.png';
import green from './Colors/green.png';
import cyan from './Colors/cyan.png';
import purple from './Colors/purple.png';
import orange from './Colors/orange.png';

import { Button, Paper, AppBar, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

// Helper functions
const capitalizeFirst = function(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
// End of Helper functions

// Materials-UI Styles
const useStyles = makeStyles((theme: Theme) => createStyles({
  title: {
    'justify-content': "center"
  }
}));

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
          <b>{capitalizeFirst(props.color)} {props.count}</b>
        </div>
        <div className="bush-row1-cell">
          {props.count === 0 ? <div className="blank-line blank-height">&nbsp;</div> : RoseArray(props.count, props.color, "state")}
        </div>
      </div>
      {isClicked 
      ? <Button className="rose-button" variant="contained" color="secondary" onClick={() => gameUpdate(1)}>Put Back</Button>
      : props.colorsCapped || props.count === 0
        ? <Button className="rose-button"  variant="outlined" disabled>{props.count === 0 ? "Empty" : "Colors Capped"}</Button>
        : <Button className="rose-button"  variant="contained" color="primary" onClick={() => gameUpdate(-1)}>Pick Rose</Button>
      }
      <div className="blank-line-thin">&nbsp;</div>
      {isClicked
      ? RoseArray(1, props.color, "picked")
      : <div className="blank-line blank-height">&nbsp;</div>}
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
    <b>{capitalizeFirst(props.color)} {props.count}</b>
    <Button variant="outlined" onClick={()=> {if (props.count !== 0) setCount(props.count-1)}}>{"-"}</Button>
    <Button variant="outlined" onClick={()=> {setCount(props.count+1)}}>{"+"}</Button>
    </>
  )
}

function GameSetup(props: {init: colorSet, setGameStateSetup: (init: colorSet) => void}) {
  const init = props.init;
  let initKeyArr = Object.keys(init) as Array<keyof colorSet>;

  const [game_setup_cache, setGameSetupCache] = useState(init); // Cache updates to the initial game state
  const [isConfirm, setIsConfirm] = useState(false); // Whether or not the Setup Button is flashing the confirm message

  useEffect(() => {
    if (isConfirm === true) {
      const timer = setTimeout(() => setIsConfirm(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isConfirm]);

  return (
  <>
    <div className="setup">
    {initKeyArr.map((key) => <RoseCounter key={key + "Setup"} count={game_setup_cache[key]} color={key} 
      setCount={(count) => {
        let new_game_setup_cache = {} as colorSet;
        Object.assign(new_game_setup_cache, game_setup_cache);
        new_game_setup_cache[key] = count;
        setGameSetupCache(new_game_setup_cache);
      }}/>)}
    </div>
    <Button size='large' onClick={() => {setIsConfirm(true); props.setGameStateSetup(game_setup_cache)}}>
        {isConfirm ? "Updated!" : "Setup New Game"}
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
// Returns True if in winning position, false if in losing position
// Also passes a callback to display optimal moves in the case of winning positions
async function isWinning(game: number[], callback = (result: boolean, game: number[]) => {}) {
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

  let best_move: number[] = [];

  async function isWinning_aux(game: number[], head=true, child=false): Promise<boolean> {

  if (inCache(game, cache_loss)) { if (child) {best_move = game; return false;}}
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
        if (child) {
          console.log(game);
          best_move = game;
        }
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
    best_move = game;
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
  callback(result, best_move);
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
const classes = useStyles();

let game_state_default: colorSet = {// Game State: Roses remaining on each Bush
  red: 3,
  blue: 3,
  green: 3,
  purple: 3,
  orange: 3,
  cyan: 3,
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

useEffect(() => { // handles changes to game_state_init
  setGameHistory([game_state_init]);
  setGameHistoryIndex(0);
}, [game_state_init]);

const [button_is_clicked, setButtonIsClicked] = useState(button_is_clicked_init);
const [curr_player, setCurrPlayer] = useState(true);
const [colorsCapped, setColorsCapped] = useState(false); // whether or not a player has already picked 2 colors for their move
const [gameOver, setGameOver] = useState(false); // whether or not the game is over

useEffect(() => { // handle changes to game_history_index
  // update game_state
  let new_game_state = game_history[game_history_index];
  setGameState(new_game_state);

  // cleanup
  setGameBuffer(buffer_init);
  setCurrPlayer(game_history_index % 2 === 0);
  setColorsCapped(false);
  setButtonIsClicked(button_is_clicked_init);

  let remaining_roses = Object.values(new_game_state).reduce((acc,val) => acc+=val, 0);
  if (remaining_roses === 0) {
    setGameOver(true);
  } else {
    setGameOver(false);
  }
}, [game_history_index, game_history]);

// Game Analysis States
enum AnalysisStates {
  Ready, Loading, Confirm
};
const [analysisProgress, setAnalysisProgress] = useState(AnalysisStates.Ready);
const [analysisContent, setAnalysisContent] = useState("Default Content");

const displayAnalysis = function(result: boolean, game: number[]) { // Handler for showing Game Analysis results
  let content = "";
  if (result) { // Winning Position
    content = "Position is Winning";
    if (game.length !== 0) {
      content += " with Best Move" + JSON.stringify(game);
    }
  } else { // Losing Position
    content = "Position is Losing";
  }
  setAnalysisProgress(AnalysisStates.Confirm);
  setAnalysisContent(content);
};

const getAnalysisStateText = function(state: AnalysisStates) {
  switch (state) {
    case AnalysisStates.Ready:
      return "Analyze Position";
    case AnalysisStates.Loading:
      return "Loading...";
    case AnalysisStates.Confirm:
      return "Analysis Complete!";
  }
}

useEffect(() => { // After a delay, reset the Analysis button to a ready state
  if (analysisProgress === AnalysisStates.Loading) {
    isWinning(Object.values(game_state), displayAnalysis);
  } else if (analysisProgress === AnalysisStates.Confirm) {
    const timer = setTimeout(() => setAnalysisProgress(AnalysisStates.Ready), 2000);
    return () => clearTimeout(timer);
  }
}, [analysisProgress]);

let stateKeyArr  = Object.keys(game_state) as Array<keyof colorSet>;

return (
  <>
    <AppBar position="static"><Typography align="center" variant="h2">Princess and Roses Game</Typography></AppBar>
    <div className="blank-line">&nbsp;</div>
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

    <div className="blank-line">&nbsp;</div>

    <div className="flexbox-main">
      <div className="rules"> <strong>How to Play:</strong> On your move you can either 
        <ol>
          <li>Take one rose of any color</li> 
          <li>Take two roses of differing colors</li>
        </ol>
        The Winner is the player who takes the final rose. 
      </div>
      <div className="update">
        <Button className="update-button" variant="outlined" onClick={() => {
          // Add current game_state to history and increment index
          let new_index = game_history_index + 1;
          setGameHistory([...game_history.slice(0, new_index), game_state]);
          setGameHistoryIndex(new_index);
          }}>
          { gameOver
            ? `Game over. Winner is player ${curr_player ? 2 : 1}`
            : `Confirm Move (Player ${curr_player ? 1 : 2})`
          }
        </Button>
        {game_history_index !== 0 ?
        <Button className="next-button" onClick={() => setGameHistoryIndex(game_history_index - 1)}>
          Previous Move
        </Button>
      :  <Button className="next-button" disabled>
          Previous Move
        </Button>}
        {game_history_index !== game_history.length-1 ?
        <Button className="next-button" onClick={() => setGameHistoryIndex(game_history_index + 1)}>
          Next Move
        </Button>
      : <Button className="next-button" disabled>
          Next Move
        </Button>}
      </div>

      <Button onClick={() => {
        console.log("Beginning Analysis"); 
        setAnalysisProgress(AnalysisStates.Loading); 
        }}>
        {getAnalysisStateText(analysisProgress)}
      </Button>
      <Paper>{analysisContent}</Paper>
    </div>
    <div className="blank-line">&nbsp;</div>
    <GameSetup init={game_state_init} setGameStateSetup={setGameStateSetup}/>
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
