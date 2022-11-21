import { useAuth0 } from "@auth0/auth0-react";
import axios, { AxiosInstance } from "axios";
import React, { useContext, useEffect, useState } from "react";

const AuthenticatedAxiosContext = React.createContext<AxiosInstance>(null!); // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-774430643

export function AxiosProvider(props: React.PropsWithChildren) {
  const { getAccessTokenSilently } = useAuth0();

  const [authenticatedAxiosInstance] = useState(() =>
    axios.create({ baseURL: process.env.REACT_APP_API_URL })
  );

  useEffect(() => {
    authenticatedAxiosInstance.interceptors.request.clear();
    authenticatedAxiosInstance.interceptors.request.use(async (axiosConfig) => {
      axiosConfig.headers = {
        ...axiosConfig.headers,
        Authorization: `Bearer ${await getAccessTokenSilently()}`,
      };
      return axiosConfig;
    });
  }, [getAccessTokenSilently, authenticatedAxiosInstance]);

  return (
    <AuthenticatedAxiosContext.Provider value={authenticatedAxiosInstance}>
      {props.children}
    </AuthenticatedAxiosContext.Provider>
  );
}

export function useAuthenticatedAxios(): AxiosInstance {
  return useContext(AuthenticatedAxiosContext);
}
