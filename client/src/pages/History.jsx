import { useState, useEffect } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for displaying the user's past scans
export default function History() {
  const [scans, setScans] = useState([]);
  
  //stores the id of the scan the user tapped on to show the dropdown
  const [expanded, setExpanded] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  //this is where we get the user's history from the backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/scans`, { credentials: "include" })
      .then((r) => r.json())
      //saves the array of scans into the state
      .then(setScans);
  }, []);

  //claude generated UI
  return (
    <main className="max-w-md mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">History</h1>
      <Button onClick={() => window.location = "/profile"}>Back to Profile</Button>

      {scans.length === 0 ? (
        <p>No scans saved yet.</p>
      ) : (
        scans.map((scan) => (
          <Card key={scan.id}>
            {/* The list item summary that can be tapped */}
            <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => {
                setExpanded(expanded === scan.id ? null : scan.id);
                setShowHeatmap(false);
              }}
            >
              <p className="font-bold">{new Date(scan.created_at).toLocaleString()}</p>
              
              <div className="flex items-center gap-2">
                <Badge label={scan.prediction} confidence={scan.malignant_probability} />
                {/* dropdown symbol that flips based on expanded state */}
                <span className="text-text/70">{expanded === scan.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* The dropdown big container, only shows if this specific scan is expanded */}
            {expanded === scan.id && (
              <div className="mt-4 flex flex-col gap-3 border-t border-surface pt-4">
                <img 
                  src={showHeatmap && scan.heatmap ? scan.heatmap : `data:image/jpeg;base64,${scan.photo}`} 
                  alt="Scan" 
                  className="w-full rounded-md object-cover" 
                />
                
                {scan.heatmap && (
                  <Button onClick={() => setShowHeatmap(!showHeatmap)}>
                    {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                  </Button>
                )}
                
                <p className="mt-2">Benign: {((1 - scan.malignant_probability) * 100).toFixed(1)}%</p>
                <p>Malignant: {(scan.malignant_probability * 100).toFixed(1)}%</p>
              </div>
            )}
          </Card>
        ))
      )}
    </main>
  );
}