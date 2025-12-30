import { NavigateFunction } from "react-router-dom";

// Helper to open the login modal using router navigation
export function openLogin(navigate: NavigateFunction) {
  // navigate to /login (could be a route that shows a modal)
  navigate("/login");
}
