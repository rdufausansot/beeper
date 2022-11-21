import styles from "./Poster.module.css";
import React, { useState, ChangeEvent } from "react";
import { useAuthenticatedAxios } from "../../../../api-client/AxiosProvider";
import { Beep } from "../../../../types/Beep";

export function Poster(props: { addBeep: (beep: Beep) => void }) {
  const [content, setContent] = useState("");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= 280) {
      setContent(event.target.value);
    }
  };

  const axios = useAuthenticatedAxios();

  const handleKeyPressed = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.code === "Enter" && !event.getModifierState("Shift")) {
      const response = await axios.post("/beep", {
        content: content.slice(0, content.length - 1),
      });

      props.addBeep(response.data);

      setContent("");
    }
  };

  return (
    <form>
      <label>
        <div>What's happening?</div>
        <textarea
          value={content}
          onChange={handleChange}
          onKeyUp={handleKeyPressed}
          className={styles.textarea}
        />
      </label>
    </form>
  );
}
