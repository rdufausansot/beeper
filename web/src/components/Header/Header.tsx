import { useAuth0 } from "@auth0/auth0-react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

export function Header() {
  const { user, logout, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (!user) {
    return <button onClick={loginWithRedirect}>✨ Login ✨</button>;
  }

  const displayBackArrow =
    location.pathname !== "/" && location.pathname !== "/home";

  return (
    <div className={styles.header}>
      {displayBackArrow && (
        <Link className={styles.homeLink} to="/home">
          🏠 Home
        </Link>
      )}
      <button
        onClick={() => logout({ returnTo: "" })}
        className={styles.logoutButton}
      >
        logout -
      </button>
      <img
        className={styles.profilePicture}
        src={user.picture}
        alt={`Profile pic of user ${user.nickname}`}
      ></img>
    </div>
  );
}
