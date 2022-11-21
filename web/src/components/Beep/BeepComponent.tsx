import React from "react";
import { Link } from "react-router-dom";
import { useAuthenticatedAxios } from "../../api-client/AxiosProvider";
import { Beep } from "../../types/Beep";
import styles from "./BeepComponent.module.css";

export function BeepComponent(
  props: {
    beep: Beep;
    likeToggler: (beepId: string, liked: boolean) => void;
  } & React.PropsWithChildren
) {
  const axios = useAuthenticatedAxios();

  const toggleLike = async () => {
    if (props.beep.liked) {
      await axios.put(`/unlike/${props.beep.id}`);
      props.likeToggler(props.beep.id, false);
    } else {
      await axios.put(`/like/${props.beep.id}`);
      props.likeToggler(props.beep.id, true);
    }
  };

  return (
    <div className={styles.beep}>
      <div className={styles.beepHeader}>
        <Link to={`/user/${props.beep.author.username}`}>
          <img
            className={styles.authorProfilePicture}
            src={props.beep.author.picture}
            alt="Profile pic"
          ></img>
        </Link>
        <div className={styles.beepHeaderText}>
          <Link
            className={styles.author}
            to={`/user/${props.beep.author.username}`}
          >
            {props.beep.author.username}
          </Link>
          <span className={styles.createdAt}>
            {" "}
            - {new Date(props.beep.createdAt).toLocaleString()} -{" "}
          </span>
          <span
            style={{
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: props.beep.liked ? "bold" : "normal",
            }}
            onClick={toggleLike}
          >
            {props.beep.likeCount} +
          </span>
        </div>
      </div>
      <div>{props.beep.content}</div>
    </div>
  );
}
