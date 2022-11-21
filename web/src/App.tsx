import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./pages/Root/Root";
import { BeepDetails } from "./pages/BeepDetails/BeepDetails";
import { Home } from "./pages/Home/Home";
import { UserProfile } from "./pages/UserProfile/UserProfile";
import { Header } from "./components/Header/Header";

const router = createBrowserRouter([
  {
    path: "/",
    element: withHeader(<Root />),
  },
  {
    path: "/user/:username",
    element: withHeader(<UserProfile />),
  },
  {
    path: "/home",
    element: withHeader(<Home />),
  },
  {
    path: "/beep",
    element: <BeepDetails />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

function withHeader(element: JSX.Element) {
  return (
    <>
      <Header></Header>
      {element}
    </>
  );
}

export default App;
