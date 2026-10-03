import { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // added this so the backend fetch works

export default function Home() {
  //state variables for the file, preview, result, and loading state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  //aeshetic purposes...
  const [loading, setLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

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
    setSaveStatus(null); // resets the save button for new photos
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

  //this is for sending the scan data to the backend
  async function handleSaveScan() {
    setSaveStatus("saving");
    
    const body = new FormData();
    body.append("photo", file); 
    body.append("heatmap", result.heatmap || ""); 
    body.append("prediction", result.prediction);
    body.append("malignant_probability", result.probabilities.malignant); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/scans`, {
        method: "POST",
        credentials: "include",
        body,
      });

      if (!res.ok) throw new Error("Failed to save");
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
    }
  }

  //claude generated UI
  return (
    <main className="max-w-md mx-auto p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Scan a lesion</h1>
      <Card>
        <input type="file" accept="image/*" onChange={pickFile} />
        {preview && (
          <div className="flex flex-col gap-3 mt-3">
            <img src={showHeatmap && result?.heatmap ? result.heatmap : preview} alt="Selected lesion" className="rounded-md w-full" />
            {result?.heatmap && (
              <Button onClick={() => setShowHeatmap(!showHeatmap)}>Heat map</Button>
            )}
            <Button onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>)}
      </Card>

      {result && !result.error && (
        <Card title="Result">
          <Badge label={result.prediction} confidence={result.probabilities[result.prediction]} />
          <p className="mt-2">Benign: {(result.probabilities.benign * 100).toFixed(1)}%</p>
          <p>Malignant: {(result.probabilities.malignant * 100).toFixed(1)}%</p>
          
          <div className="mt-4 flex flex-col">
            {saveStatus === "saved" ? (
              <p className="text-primary font-bold text-center mt-2">Scan saved successfully!</p>
            ) : (
              <Button variant="primary" onClick={handleSaveScan} disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? "Saving..." : "Save Scan"}
              </Button>
            )}
            {saveStatus === "error" && <p className="text-malignant text-center mt-2">Failed to save scan.</p>}
          </div>
        </Card>
      )}

      {result?.error && (
        <Card>
          <p className="text-malignant">{result.error}</p>
        </Card>
      )}

      <p className="text-sm text-text/70">This is a screening aid, not a medical diagnosis.</p>
    </main>
  );
}