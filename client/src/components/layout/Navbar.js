import React, { useContext } from "react";
import { UserContext } from "../../UserContext";
import SignedInMenu from "./SignedInMenu";
import SignedOutMenu from "./SignedOutMenu";
import "./navbar.css";
const Navbar = (props) => {
  const { user, setUser } = useContext(UserContext);

  const logout = async () => {
    try {
      const res = await fetch("/logout", {
        credentials: "include",
      });
      const data = res.json();
      console.log("logout data", data);
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };
  const menu = user ? <SignedInMenu logout={logout} /> : <SignedOutMenu />;
  return (
    <div>
      <nav className="navdo">
        <div className="nav-wrapper">
          <a href="/" className="brand-logo logoChange">
            <p>Teams</p>
          </a>
          <a href="#" data-target="mobile-demo" className="sidenav-trigger">
            <i className="material-icons">menu</i>
          </a>

          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <p className="para">{menu}</p>
          </ul>
        </div>
      </nav>
      <ul className="sidenav" id="mobile-demo">
        {menu}
      </ul>
    </div>
  );
};

export default Navbar;
