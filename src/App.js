// client/src/App.js

import React from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: "",  //Message confirming conenction to backend
      file: null,  //Uploaded file
      recievedFile: null  //File recieved from backend
    }
    this.fileChanged = this.fileChanged.bind(this);
    this.sendBtnClicked = this.sendBtnClicked.bind(this);
    this.getBtnClicked = this.getBtnClicked.bind(this);

  }

  //Display message confirming connection to backend
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

  //On new upload file is selected
  fileChanged(event) {
    this.setState({ file: event.target.files[0] })
  }

  //On 'upload' button clicked
  sendBtnClicked() {
    //Create a FormData object with and popluate with file data
    const formData = new FormData();
    formData.append("uploadedFile", this.state.file, this.state.file.name);

    //Make post request to backend to store the uploaded file
    fetch("/upload", {
      method: "POST",
      body: formData
    })
      .then((res) => res.json())
      .then((jsonRes) => {
        console.log(jsonRes.message);
        return this.setState({ data: jsonRes.message })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getBtnClicked() {

    fetch("/getFiles").then((res) => {
      //Create a reader for the body of the response
      const reader = res.body.getReader();

      const read = () => {
        // read the data
        reader.read().then(({ done, value }) => {
          //done is set to true when the connection is closed
          if (done) {
            console.log("END OF DATA STREAM -- CONNECTION CLOSED");
            return;
          }

          //Decode the sent data
          const decoder = new TextDecoder();
          console.log("[received]:" + decoder.decode(value));
          read();
        });
      };

      read();
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
          <button onClick={this.sendBtnClicked}>Send file</button>
          <br />
          <button onClick={this.getBtnClicked}>Get files</button>
          <p>{this.state.data}</p>
        </header>
      </div>
    );
  }

}

export default App;
