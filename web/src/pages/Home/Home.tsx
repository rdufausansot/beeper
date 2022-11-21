import { useAuth0 } from "@auth0/auth0-react";
import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedAxios } from "../../api-client/AxiosProvider";
import { Beep } from "../../types/Beep";
import { BeepComponent } from "../../components/Beep/BeepComponent";
import { Poster } from "./components/Poster/Poster";
import styles from "./Home.module.css";

export function Home() {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const axios = useAuthenticatedAxios();

  const [beeps, setBeeps] = useState<Beep[] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    axios.get("/home").then((resp) => setBeeps(resp.data));
  }, [isAuthenticated, axios, navigate]);

  const addBeep = useCallback(
    (newBeep: Beep) => setBeeps([newBeep, ...(beeps ?? [])]),
    [beeps]
  );

  const likeToggler = useCallback(
    (beepId: string, liked: boolean) => {
      if (beeps === null) {
        throw new Error("Unexpected state");
      }
      const beepIndex = beeps.findIndex((beep) => beep.id === beepId);
      if (beepIndex === -1) {
        throw new Error("Unexpected state");
      }
      const updatedBeep = { ...beeps[beepIndex], liked };
      updatedBeep.likeCount += liked ? 1 : -1;
      const newBeepList = [...beeps];
      newBeepList[beepIndex] = updatedBeep;
      setBeeps(newBeepList);
    },
    [beeps]
  );

  return (
    <>
      <h1>Welcome!</h1>
      <Poster addBeep={addBeep}></Poster>
      {beeps != null &&
        beeps.map((beep: any) => (
          <div key={beep.id} className={styles.beep}>
            <BeepComponent
              likeToggler={likeToggler}
              beep={beep}
            ></BeepComponent>
          </div>
        ))}
    </>
  );
}
