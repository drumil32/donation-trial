import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check login status
    axios
      .get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/auth/status`, { withCredentials: true })
      .then((res) => {
        setIsLoggedIn(res.data.loggedIn);
        if (res.data.loggedIn) {
          setUser(res.data.user);
        }
      })
      .catch((err) => {
        console.error("Error checking login status:", err);
      });
  }, []);

  return (
    <div>
      <h1>Google OAuth Status</h1>
      {isLoggedIn ? (
        <div>
          <h2>Welcome, {user.displayName}!</h2>
          <a href={import.meta.env.VITE_BACKEND_BASE_URL + '/api/logout'}>Logout</a>
        </div>
      ) : (
        <div>
          <h2>You are not logged in</h2>
          <a href={import.meta.env.VITE_BACKEND_BASE_URL + '/api/auth/google'}>
            <button>Login with Google</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
