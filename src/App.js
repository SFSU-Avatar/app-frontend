// client/src/App.js

import React from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: "",
      file: null,
      recievedFile: null
    }
    this.fileChanged = this.fileChanged.bind(this);
    this.buttonClicked = this.buttonClicked.bind(this);

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

  fileChanged(event) {
    this.setState({ file: event.target.files[0] })
  }

  buttonClicked() {
    const formData = new FormData();
    formData.append("uploadedFile", this.state.file, this.state.file.name);

    fetch("/upload", {
      method: "POST",
      body: formData
    })
      .then((res) => res.json())
      .then((dataBlob) => {
        // let myFile = constructFileFromLocalFileData(dataBlob);
        // console.log(myFile);
        // var reader = new FileReader();
        // reader.addEventListener("loadend", function () {
        //   console.log(reader.result); // will print out file content
        // });
        // reader.readAsText(dataBlob);
        const myFile = new File(dataBlob.arrayBuffer, dataBlob.name, {
          type: dataBlob.type,
        });
        console.log(myFile);
        return this.setState({ recievedFile: myFile })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="App" >
        <header className="App-header">
          <label htmlFor="uploadedFile">Choose an audio file to upload</label>
          <br />
          <input type="file" name="uploadedFile" onChange={this.fileChanged}></input>
          <br />
          <button onClick={this.buttonClicked}>Send file</button>
          <p>{this.state.data}</p>
        </header>
      </div>
    );
  }

}

export default App;
