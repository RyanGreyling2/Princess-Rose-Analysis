import {useState, useEffect} from 'react';
import './App.css';

import { Button } from '@material-ui/core';

import Dice from './PNG_transparency_demonstration_1.png';
import Luffy from './Luffy.jpg';

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
        ? <Button className="rose-button"  variant="outlined" disabled>Colors Capped</Button>
        : <Button className="rose-button"  variant="contained" color="primary" onClick={() => gameUpdate(-1)}>Pick Rose</Button>
      }
    </div>
  );
}

type colorSet = {
  red: number,
  blue: number,
  green: number,
  purple: number,
  orange: number,
  cyan: number,
};

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
let game_state_init: colorSet = {// Game State: Roses remaining on each Bush
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

const [game_state, setGameState] = useState(game_state_init);
const [game_buffer, setGameBuffer] = useState(buffer_init); // buffer to cache potential moves
const [button_is_clicked, setButtonIsClicked] = useState(button_is_clicked_init);
const [curr_player, setCurrPlayer] = useState(true);
const [colorsCapped, setColorsCapped] = useState(false); // whether or not a player has already picked 2 colors for their move

useEffect(() => {
    "pass";
}, [game_state]);

let stateKeyArr = Object.keys(game_state) as Array<keyof colorSet>;
let bufferKeyArr = Object.keys(game_buffer) as Array<keyof colorSet>;

const pickedRoses = bufferKeyArr.map((key) => RoseArray(game_buffer[key], key, "picked")).flat();

return (
  <>
    <h1>Princess and Roses Game</h1>
    <div className="flexbox-bushes">{stateKeyArr.map((key) => 
      <Bush key={key} color={key} count={game_state[key]} colorsCapped={colorsCapped} isClicked={button_is_clicked[key]}
        gameUpdate={(change) => { 
              // Add potential moves to game_state and game_buffer
              let new_game_state = {} as colorSet;
              let new_game_buffer = {} as colorSet;
              Object.assign(new_game_state, game_state);
              new_game_state[key] += change;
              setGameState(new_game_state);

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
      <Button className="update-button" variant="outlined" onClick={() => {// Move buffered changes into game state
                setGameBuffer(buffer_init);
                setCurrPlayer(!curr_player);
                setColorsCapped(false);
                setButtonIsClicked(button_is_clicked_init);
        }}>
        Update State
      </Button>
      <div>Current Player is {curr_player ? 1 : 2}</div>
    </div>
    <br/>
    <div className="rules"> <strong>How to Play:</strong> On your move you can either 
      <ol>
        <li>Take one rose of any color</li> 
        <li>Take two roses of differing colors</li>
      </ol>
      The Winner is the player who takes the final rose. 
    </div>
    <img src={Dice} alt="Dice"/>
    <img src={Luffy} alt="Money D. Luffy"/>
    <img src={Luffy} alt="Money D. Luffy"/>

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
