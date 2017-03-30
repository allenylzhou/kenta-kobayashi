import React, { Component } from 'react';
import Spinner from 'react-spin';
import Dropzone from 'react-dropzone';
import Masonry from 'react-masonry-component';
import './App.css';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response) {
  return response.json()
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isUploading: false,
      displayStr: '',
      preview: '',
      faces: []
    }
  }

  render() {
    const { isUploading, preview, displayStr, faces } = this.state
    return (
      <div className="App">
        <Dropzone onDrop={this.onDrop.bind(this)} className={'my-dropzone'}>
          {
            isUploading
            ? <div>
              <Spinner />
              <p>Wait for it...</p>
            </div>
            : preview.length > 0
              ? <div>
                <img src={preview} width='160'/>
                <p>{displayStr}</p>
              </div>
              : <div>Click/tap here to take/upload a picture of your face to see which celebrities you look like</div>
          }
        </Dropzone>
        <Masonry
          className={'my-gallery-class'} // default ''
          options={{}} // default {}
          disableImagesLoaded={false} // default false
          updateOnEachImageLoad={false} // default false and works only if disableImagesLoaded is false
        >
          {
            faces.map((face, i) => {
              return <div key={i} className="grid-item">
                <img alt={face.name} src={face.url} />
                <p>{face.name}</p>
              </div>
            })
          }
        </Masonry>
      </div>
    );
  }

  onDrop(acceptedFiles, rejectedFiles) {
    const firstFile = acceptedFiles[0]
    const body = new FormData()
    body.append('image', firstFile)
    this.setState({
      isUploading: true,
      faces: []
    })
    fetch('https://cors-anywhere.herokuapp.com/https://devel.thehive.ai/classify?endpoint=celebfaces&debug=wompwomp', {
      method: 'POST',
      body
    })
    .then(checkStatus)
    .then(parseJSON)
    .then(data => {
      const faces = data.timeline[0].bounding_boxes.length > 0
      ? data.timeline[0].bounding_boxes[0].celeb_score_list
      : []
      this.setState({
        isUploading: false,
        preview: firstFile.preview,
        displayStr: data.display_string,
        faces
      })
    })
  }
}

export default App;
