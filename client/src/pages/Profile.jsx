import { useState, useEffect } from "react";
import Card from "../components/Card";
import Button from "../components/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for displaying the user profile
export default function Profile() {
  const [user, setUser] = useState(null);

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

  //claude generated UI
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <Card>
        {user ? (
          <div className="flex flex-col gap-4">
            <p>{user.email}</p>
            <Button variant="primary" onClick={logout}>Log out</Button>
          </div>
        ) : (
          <p>You are not logged in.</p>
        )}
      </Card>
    </main>
  );
}