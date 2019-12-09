import React from "react";
import logo from "./logo.svg";
import "./App.css";

import PotionMaster from "./potion-gen/update.js";
import "./potion-gen/caco-ingredients.json";

import ComponentPicker from "./ComponentPicker.js";
import Layout from "./Sidebar.js";

const pm = new PotionMaster(1);
const options = pm.components();


var selectionList = []

///this isnt working
// const conditions = {
//     isWorking: (list, id) => console.log("this function has been run"),
//     getSelections: (list, id) => { selectionList = list }
// }

function App() {
    return (
        <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <Layout>
          <div name="picker">
            <ComponentPicker 
            options={options} 
            callbackFunction={(selections)=>selectionList = selections}


             />
          </div>
        </Layout>
        <div
          key="nglkivcdfufejkuejcferefjvhlvgcjt"
          onClick={e => console.log("selectionList",selectionList)}
          className=""
        >
          Submit
        </div>

      </header>
    </div>
    );
}

export default App;