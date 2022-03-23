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
    this.buttonClicked = this.buttonClicked.bind(this);

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
  buttonClicked() {
    //Create a FormData object with and popluate with file data
    const formData = new FormData();
    formData.append("uploadedFile", this.state.file, this.state.file.name);

    //Make post request to backend to store the uploaded file
    fetch("/upload", {
      method: "POST",
      body: formData
    })
      .then((res) => res.blob())
      .then((dataBlob) => {
        //Print out the data blob content
        var reader = new FileReader();
        reader.addEventListener("loadend", function () {
          console.log(reader.result); // will print out file content
        });
        reader.readAsText(dataBlob);

        //Create a file object from the data blob
        const myFile = new File([dataBlob], `recievedFile`, {
          type: dataBlob.type,
        });

        //Save the file to state
        return this.setState({ recievedFile: myFile });
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
