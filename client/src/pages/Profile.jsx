import { useState, useEffect } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import defaultProfile from "../images/default_profile.jpg";
import FormField from "../components/FormField";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for displaying the user profile
export default function Profile() {
  const [user, setUser] = useState(null);

  //this is for editing
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState(null);

  //this is for deleting
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  //this is where we get user data and then have it displayed on their profile
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/me`, { credentials: "include" })
      .then((r) => r.json())
      //saves the user credential into user, such as email and name (to be added)
      .then(setUser);
  }, []);

  //when the user logs out, it redirects them back to the signup page
  async function logout() {
    await fetch(`${API_BASE_URL}/api/logout`, { method: "POST", credentials: "include" });
    window.location = "/signup";
  }

  //this is for saving the profile changes (name, password, and profile picture)
  async function save() {
    if (pic) {
      const body = new FormData(); body.append("image", pic);
      const res = await fetch(`${API_BASE_URL}/api/me/profile`, { method: "POST", credentials: "include", body });
      
      //if the server rejects the picture, stop the reload and show the error
      if (!res.ok) {
        const errData = await res.json();
        alert("Picture upload failed: " + (errData.error || "Unknown error"));
        return; 
      }
    }
    
    if (name !== user.name || password) {
      const res = await fetch(`${API_BASE_URL}/api/me`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || user.name, password })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert("Profile update failed: " + (errData.error || "Unknown error"));
        return;
      }
    }
    //if everything went fine, reloads
    window.location.reload(); 
  }

  //this is for deleting the account
  async function deleteAccount() {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      method: "DELETE", 
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword })
    });
    
    if (!res.ok) {
      const errData = await res.json();
      alert("Deletion failed: " + (errData.error || "Unknown error"));
      return;
    }
    //if successful, sends them to signup page
    window.location = "/signup";
  }

  //claude generated UI
return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <Card>
        {user ? (
          <div className="flex flex-col gap-4">
            <img src={user.profile ? `data:image/jpeg;base64,${user.profile}` : defaultProfile} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            
            {isEditing ? (
              <>
                <input type="file" accept="image/*" onChange={(e) => setPic(e.target.files[0])} />
                <FormField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <FormField label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button variant="primary" onClick={save}>Confirm</Button>
                <Button onClick={() => setIsEditing(false)}>Discard</Button>
              </>
            ) : isDeleting ? (
              <>
                <p className="font-bold text-malignant">Delete Account</p>
                <p className="text-sm">This action cannot be undone.</p>
                <FormField label="Confirm Password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                <Button variant="primary" onClick={deleteAccount}>Confirm Delete</Button>
                <Button onClick={() => { setIsDeleting(false); setDeletePassword(""); }}>Cancel</Button>
              </>
            ) : (
              <>
                <p className="font-bold">{user.name}</p>
                <p>{user.email}</p>
                <Button variant="primary" onClick={() => { setIsEditing(true); setName(user.name); setPassword(""); setPic(null); setIsDeleting(false); }}>Edit Profile</Button>
                <Button onClick={() => window.location = "/history"}>View Scan History</Button>
                <Button onClick={logout}>Log out</Button>
                <Button onClick={() => setIsDeleting(true)}>Delete Account</Button>
              </>
            )}
          </div>
        ) : (
          <p>You are not logged in.</p>
        )}
      </Card>
    </main>
  );
}