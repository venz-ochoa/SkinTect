import { useState } from "react";
import Card from "../components/Card";
import FormField from "../components/FormField";
import Button from "../components/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//this is for sign up
export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "done" | { error }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    //this is where we use the signup thing we made in server.js
    //everything is the same in login.jsx (the explanation i mean)
    //refer there, everything here is the same, most of the difference is found in server.js
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      setStatus("done");
    } catch (err) {
      setStatus({ error: err.message });
    }
  }

  //claude generated UI
  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create your account</h1>

      <Card>
        {status === "done" ? (
          <p>Account created. You can log in now.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={status === "loading"}>
              {status === "loading" ? "Signing up..." : "Sign up"}
            </Button>
            {status?.error && <p className="text-malignant">{status.error}</p>}
          </form>
        )}
      </Card>
    </main>
  );
}