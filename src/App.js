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
      recievedFiles: [],  //File recieved from backend
      frameNum: 0,
      userAudio: null,
      checked: false,
      userText: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      start: 0,
      nextAt: 0
    }

    this.fileChanged = this.fileChanged.bind(this);
    this.textChanged = this.textChanged.bind(this);
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
    this.setState({ userAudio: event.target.files[0] });
  }

  //On text field content changed
  textChanged(event) {
    this.setState({ userText: event.target.value });
  }

  //On 'upload' button clicked
  sendBtnClicked() {
    const formData = new FormData();
    if (this.state.checked) {
      //Create a FormData object with and popluate with file data
      formData.append("uploadedFile", this.state.userAudio, this.state.userAudio.name);

      //Make post request to backend to store the uploaded file
      fetch("/uploadFile", {
        method: "POST",
        body: formData
      })
        .then((res) => res.json())
        .then((jsonRes) => {
          console.log(jsonRes.message);
          this.callVOCA()
          return this.setState({ data: jsonRes.message })
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      //Send text
      formData.append("userText", this.state.userText);
      fetch("/uploadText", {
        method: "POST",
        body: formData
      }).then(res => res.blob())
        .then(resFile => {
          console.log(resFile);
          this.callVOCA();
          this.setState({ userAudio: resFile });
        });
    }

  }

  callVOCA() {
    const controller = new AbortController()

    // 10 min timeout:
    const timeoutId = setTimeout(() => controller.abort(), 3600000)

    fetch("/getFiles", { signal: controller.signal }).then((res) => {
      //Create a reader for the body of the response
      const reader = res.body.getReader();
      var currObj = "";
      this.setState({ recievedFiles: [] });

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
            //   if (currObj.replace(/[^a]/g, "").length > 1) {
            //     console.log("Bad File Found");
            //     var multObjs = currObj.split(/(?<=\})/);
            //     multObjs.forEach(obj => {
            //       console.log("PART OF BAD OBJECT: " + obj);
            //       var jsonObj = JSON.parse(obj);
            //       var newArray = this.state.recievedFiles;
            //       newArray.push(jsonObj.arrayBuffer);
            //       this.setState({ recievedFiles: newArray });
            //     });
            //   } else {
            //Split up the data chunk into the complete object
            //and the start of the new object
            var parts = currObj.split("$");
            let completeObj = parts[0];
            currObj = parts[1];
            // console.log("CURR OBJ: " + currObj)
            // console.log("COMPLETE OBJ: " + completeObj);
            // console.log("BEORE PARSE: ");
            // console.log(completeObj);
            var jsonObj = JSON.parse(completeObj);
            console.log("NAME: " + jsonObj.name)

            var newArray = this.state.recievedFiles;
            newArray.push(jsonObj.arrayBuffer);
            this.setState({ recievedFiles: newArray });
            //}

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

  doWork() {
    var internalCallback = () => {
      var start = performance.now();
      this.setState((prevState, props) => ({
        frameNum: prevState.frameNum + 1
      }));

      if (this.state.frameNum < this.state.recievedFiles.length - 2) {
        var duration = (performance.now() - start)
        setTimeout(internalCallback, 16.64 - duration)
      } else {
        console.log("NO LONGER MEET REQS")
        this.setState({ frameNum: 0 });
      }

    }

    setTimeout(internalCallback, 16.66)
  }

  playVid() {
    this.setState({ frameNum: 0 });

    const audioURL = URL.createObjectURL(this.state.userAudio);
    const userAudio = new Audio(audioURL);
    userAudio.play()
      .then(() => {
        this.doWork()
      })




    // .then(() => {
    //   var intervalID = window.setInterval(() => {
    //     if (this.state.frameNum == this.state.recievedFiles.length - 1) {
    //       this.setState({ frameNum: -1 });
    //       clearInterval(intervalID);
    //     }

    //     this.setState((prevState, props) => ({
    //       frameNum: prevState.frameNum + 1
    //     }));
    //   }, 16.667);
    // })
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
          <input type="text" value={"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."} onChange={this.textChanged}></input>
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

          <p>Text is {this.state.userText}</p>

          <br />
          <button onClick={this.sendBtnClicked}>Send file</button>
          <br />
          <p>{this.state.data}</p>
          <p>Number of files stored in state: {this.state.recievedFiles.length}</p>
          <p>{this.state.start}</p>
        </header>
      </div>
    );
  }

}

export default App;
