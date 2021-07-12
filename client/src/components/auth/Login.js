import React, { useState, useContext } from "react";
import { UserContext } from "../../UserContext";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";
import "./login.css";

const Login = () => {
  const { user, setUser } = useContext(UserContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const submitHandler = async (e) => {
    e.preventDefault();
    setEmailError("");
    setNameError("");
    setPasswordError("");
    console.log(name, email, password);
    try {
      const res = await fetch("/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      if (data.errors) {
        setEmailError(data.errors.email);
        setNameError(data.errors.name);
        setPasswordError(data.errors.password);
      }
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.log(error);
    }
  };
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="mains">
      <div className="containers" id="container">
        <div className="form-container sign-in-container">
          <form action="#" onSubmit={submitHandler}>
            <h2>Sign in</h2>
            <br />
            <span> use your account</span>
            <input
              id="email"
              type="email"
              className="validate ap"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="email error red-text">{emailError}</div>
            <label htmlFor="email">Email</label>
            <input
              id="password"
              type="password"
              className="validate ap"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="password error red-text">{passwordError}</div>
            <label htmlFor="password">Password</label>
            <br />
            <button className="login-btn">Log In</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button className="ghost" id="signIn">
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Welcome!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" id="signUp">
                <Link to="/signup">Sign Up</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
