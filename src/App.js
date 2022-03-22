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
    fetch("/upload")
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA: " + data.message);
        return this.setState({ data: data.message })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <form method="POST" action="/upload" encType="multipart/form-data" >
            <label htmlFor="uploadedFile">Choose an audio file to upload</label>
            <br />
            <input type="file" name="uploadedFile" ></input>
            <br />
            <button type="submit" name="submit">Send file</button>
          </form>
          <p>{this.state.data}</p>
        </header>
      </div>
    );
  }

}

export default App;
