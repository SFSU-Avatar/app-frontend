// client/src/App.js

import React from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
// import { useBox } from "@react-three/cannon";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import Switch from "react-switch";
// import { useLoader } from '@react-three/fiber'
// import { Mesh } from "three";

// import * as THREE from "three";
// import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
// import { DDSLoader } from "three-stdlib";
// import { Suspense } from "react";
// import { Texture } from "three";
// import { BufferGeometry } from "three";
// import { TextureLoader } from "three";
// import { MaterialLoader } from "three";
// import { Material } from "three";



class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: "",  //Message confirming conenction to backend
      file: null,  //Uploaded file
      recievedFiles: [],  //File recieved from backend
      frameNum: 0,
      audio: new Audio('sample.wav'),
      checked: false
    }

    this.fileChanged = this.fileChanged.bind(this);
    this.sendBtnClicked = this.sendBtnClicked.bind(this);
    this.switchFrameClick = this.switchFrameClick.bind(this);
    this.playVid = this.playVid.bind(this);
    this.switchFlipped = this.switchFlipped.bind(this);
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

  //Switch was flipped
  switchFlipped(checked) {
    this.setState({ checked });
  }

  //On new upload file is selected
  fileChanged(event) {
    this.setState({ file: event.target.files[0] })
  }

  //On 'upload' button clicked
  sendBtnClicked() {
    //Create a FormData object with and popluate with file data=
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

    fetch("/getFiles").then((res) => {
      //Create a reader for the body of the response
      const reader = res.body.getReader();
      var currObj = "";

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
          var dataChunk = decoder.decode(value);
          // console.log("[received]:" + dataChunk);

          //Add the data chunk to the current object
          currObj += dataChunk;

          //If the file delimeter is found in the current data chunk
          if (dataChunk.indexOf("$") != -1) {
            //Split up the data chunk into the complete object
            //and the start of the new object
            var parts = currObj.split("$");
            let completeObj = parts[0];
            currObj = parts[1];

            // console.log("COMPLETE OBJ: " + completeObj);
            var jsonObj = JSON.parse(completeObj);
            console.log("NAME: " + jsonObj.name)

            var newArray = this.state.recievedFiles;
            newArray.push(jsonObj.arrayBuffer);
            this.setState({ recievedFiles: newArray });
          }

          read();
        });
      };

      read();
    });
  }

  display() {
    if (this.state.recievedFiles.length <= 0) {
      return <p>No File Recieved Yet</p>
    }
    //Uncomment to download files
    // var csvURL = window.URL.createObjectURL(this.state.recievedFiles[0]);
    // var tempLink = document.createElement('a');
    // tempLink.href = csvURL;
    // tempLink.setAttribute('download', this.state.recievedFiles[0].name);
    // tempLink.click();

    return (
      <Canvas>
        <Stars />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} />
        {this.Scene()}
      </Canvas>
    )
  }

  Scene() {
    //********** LOAD FROM A FILE NAME
    // const obj = useLoader(OBJLoader, "test.obj", (loader) => { 
    //   Material
    // });

    //********** USING PRIMITIVES
    let loader = new OBJLoader();
    var myObj = loader.parse(this.state.recievedFiles[this.state.frameNum]);
    return <primitive object={myObj} scale={20} />;

    //********** USING MESHES
    // let loader = new OBJLoader();
    // var obj = loader.parse(this.state.recievedFiles[this.state.frameNum]);

    // //Set material
    // // obj.children[0].material = new THREE.MeshPhongMaterial({});

    // return (
    //   <mesh geometry={obj.children[0].geometry} /*material={obj.children[0].material}*/ scale={20}>
    //   </mesh>
    // );

  };

  switchFrameClick() {
    this.setState((prevState, props) => ({
      frameNum: prevState.frameNum + 1
    }));

  }

  playVid() {
    this.setState({ frameNum: 0 });
    this.state.audio.play()
      .then(() => {
        var intervalID = window.setInterval(() => {
          if (this.state.frameNum == this.state.recievedFiles.length - 1) {
            this.setState({ frameNum: 0 });
            clearInterval(intervalID);
          }
          this.setState((prevState, props) => ({
            frameNum: prevState.frameNum + 1
          }));
        }, 16.667);
      }
      )
  }

  render() {
    var userInput;
    if (this.state.checked) {
      userInput =
        <div>
          <label htmlFor="uploadedFile">Choose an audio file to upload</label>
          <br />
          <input type="file" name="uploadedFile" onChange={this.fileChanged}></input>
          <br />
        </div>
    } else {
      userInput =
        <div>
          <textarea></textarea>
        </div>
    }
    return (
      <div className="App" >

        <div className="window">
          {this.display()}
        </div>
        <button onClick={this.switchFrameClick}>Switch Frame</button>
        <button onClick={this.playVid}>Play!</button>
        <header className="App-header">
          <label>
            <span style={{ marginRight: '5px' }}>Use custom audio</span>
            <Switch onChange={this.switchFlipped} checked={this.state.checked} />
          </label>

          {userInput}

          <br />
          <button onClick={this.sendBtnClicked}>Send file</button>
          <br />
          <p>{this.state.data}</p>
          <p>Number of files stored in state: {this.state.recievedFiles.length}</p>
        </header>
      </div>
    );
  }

}

export default App;
