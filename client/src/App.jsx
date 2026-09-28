import { useState, useRef } from "react";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";
const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  //state variables for the file, preview, result, and loading state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  //aeshetic purposes...
  const [loading, setLoading] = useState(false);

  //this function runs when the user selcts a take a photo or upload. only allows for one photo to be selected at a time
  function pickFile(e) {
    const picked = e.target.files[0];
    //if didnt pick anything, return nothing
    if (!picked) return;
    //set file = what the user chose,
    setFile(picked);
    //set preview = a url to the image for displaying purposes, 
    setPreview(URL.createObjectURL(picked));
    //and set result = stores the json sent by the model from Google Cloud
    setResult(null);
  }

  //this function runs when the user taps on the analyze button
  //sends the image to the server, waits for json result, then sets the result state to the json result
  async function analyze() {
    //processing
    setLoading(true);
    //result not yet returned, so set result to null
    setResult(null);
    try {
        //this is for the actual process
        //create a new form data object to send the image to the server
        const body = new FormData();
        //append the image to the form data object
        body.append("image", file);
        //send the form data to the server, wait for the response, and parse it as json
        const res = await fetch(API_URL, { method: "POST", body });
        //turn it into json, throw an error if response is invalid or theres an error
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        //set the result state to the json data returned by the server
        setResult(data);
      //just general error handling, catches stuff
    } catch (err) {
      setResult({ error: err.message });
    }
    //everything is done no need to load it
    setLoading(false);
  }

  //this is what claude generated for the UI
return (
    <div>
      <h1>SkinTect</h1>
      {/* A single input handles both camera and gallery automatically on mobile */}
      <input type="file" accept="image/*" onChange={pickFile} />

      {preview && (
        <div>
          <br />
          <img src={preview} alt="preview" width="300" />
          <br />
          <button onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      )}

      {result && !result.error && (
        <div>
          {/*  This is the output of Error 2
          <li>Malignant: {(result.malignant_confidence * 100).toFixed(2)}%</li>
          <li>Benign: {(result.benign_confidence * 100).toFixed(2)}%</li>*/}

          <h2>Prediction: {result.prediction}</h2>
          <p>Benign: {(result.probabilities.benign * 100).toFixed(1)}%</p>
          <p>Malignant: {(result.probabilities.malignant * 100).toFixed(1)}%</p>

          {/* This is output of Error 3 during week 2 
          <p>Unclassified: 0.0%</p> */}
        </div>
      )}
      
      {result?.error && <p>{result.error}</p>}
    </div>
  );
}