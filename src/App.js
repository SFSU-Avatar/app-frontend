// client/src/App.js

import React from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: ""
    }
  }

  componentDidMount() {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA: " + data.message);
        return this.setState({ data: data.message })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  sendFile() {
    console.log("Sending...");
  }

  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <form method="POST" action="/upload" encType="multipart/form-data">
            <label htmlFor="uploadFile">Choose an audio file to upload</label>
            <input type="file" name="uploadFile" ></input>
            <button type="submit" name="submit">Send file</button>
          </form>
          <p>{this.state.data}</p>
        </header>
      </div>
    );
  }

}

export default App;
