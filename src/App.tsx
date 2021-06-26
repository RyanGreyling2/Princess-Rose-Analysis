import React, {useState, useEffect} from 'react';
import './App.css';
// Jules made it

import { Button } from '@material-ui/core';

import Dice from './PNG_transparency_demonstration_1.png';
import Luffy from './Luffy.jpg';
import red from './Colors/red.png';
import blue from './Colors/blue.png';
import green from './Colors/green.png';
import cyan from './Colors/cyan.png';
import purple from './Colors/purple.png';
import orange from './Colors/orange.png';
import { kMaxLength } from 'buffer';


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
  const roseArray = [];
  let color = red;
  switch (props.color){
    case "red":
      color = red;
      break
    case "blue":
      color = blue;
      break
    case "orange":
      color = orange;
      break
    case "purple":
      color = purple;
      break
    case "cyan":
      color = cyan;
      break
    case "green":
      color = green;
  }
  for (let i = 0; i < props.count; i++){
    roseArray.push(<img src={color}/> )
  }
  return (
    <div className="bush">
      <div className="bush-row1">
        <div className="bush-row1-cell">
          {props.color}
        </div>
        <div className="bush-row1-cell">
          {roseArray}
        </div>
      </div>
      {isClicked 
      ? <Button className="rose-button" variant="outlined" color="secondary" onClick={() => gameUpdate(1)}>Put Back</Button>
      : props.colorsCapped || props.count === 0
        ? <Button className="rose-button"  variant="outlined" disabled>Colors Capped</Button>
        : <Button className="rose-button"  variant="outlined" color="primary" onClick={() => gameUpdate(-1)}>Pick Rose</Button>
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
  orange: 0,
  cyan: 0,
};
let buffer_init: colorSet = {// Buffer to cache potential changes to Game State
  red: 0,
  blue: 0,
  green: 0,
  purple: 0,
  orange: 0,
  cyan: 0,
};

let button_is_clicked_init: colorSetBool = {
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


return (
  <>
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
    <br/>
    {bufferKeyArr.map((key) => <div key={key}>{key} roses: {game_buffer[key]}</div>)}
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
      <div>Colors are{colorsCapped ? "" : " not"} capped</div>
    </div>
    <img src={Dice} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
    <img src={Luffy} alt="Yellow Rose"/>
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
