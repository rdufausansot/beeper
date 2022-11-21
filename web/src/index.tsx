import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { getConfig } from "./config";
import { Auth0Provider, Auth0ProviderOptions } from "@auth0/auth0-react";
import { AxiosProvider } from "./api-client/AxiosProvider";

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider
const config = getConfig();

const providerConfig: Auth0ProviderOptions = {
  domain: config.domain,
  clientId: config.clientId,
  ...(config.audience ? { audience: config.audience } : null),
  redirectUri: window.location.origin,
  cacheLocation: "localstorage",
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Auth0Provider {...providerConfig}>
      <AxiosProvider>
        <App />
      </AxiosProvider>
    </Auth0Provider>
  </React.StrictMode>
);
