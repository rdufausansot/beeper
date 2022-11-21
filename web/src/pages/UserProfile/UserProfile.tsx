import styles from "./UserProfile.module.css";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthenticatedAxios } from "../../api-client/AxiosProvider";
import { Beep } from "../../types/Beep";
import { BeepComponent } from "../../components/Beep/BeepComponent";
import { useAuth0 } from "@auth0/auth0-react";

type UserProfileData = {
  user: {
    userId: string;
    username: string;
    picture: string;
  };
  followed: boolean;
  beeps: Beep[];
};

export function UserProfile() {
  const { isAuthenticated } = useAuth0();
  const axios = useAuthenticatedAxios();
  const navigate = useNavigate();

  const { username } = useParams();

  const [data, setData] = useState<UserProfileData | null>(null);

  const follow = useCallback(async () => {
    if (!data) {
      throw new Error(
        "Unexpected: user should be loaded when clicking follow button"
      );
    }
    await axios.put(`/follow/${data.user.userId}`);
    setData({ ...data, followed: true });
  }, [data, axios]);

  const unfollow = useCallback(async () => {
    if (!data) {
      throw new Error(
        "Unexpected: user should be loaded when clicking unfollow button"
      );
    }
    await axios.put(`/unfollow/${data.user.userId}`);
    setData({ ...data, followed: false });
  }, [data, axios]);

  const likeToggler = useCallback(
    (beepId: string, liked: boolean) => {
      if (data === null) {
        throw new Error("Unexpected state");
      }
      const beepIndex = data.beeps.findIndex((beep) => beep.id === beepId);
      if (beepIndex === -1) {
        throw new Error("Unexpected state");
      }
      const updatedBeep = { ...data.beeps[beepIndex], liked };
      updatedBeep.likeCount += liked ? 1 : -1;
      const newBeepList = [...data.beeps];
      newBeepList[beepIndex] = updatedBeep;
      setData({ ...data, beeps: newBeepList });
    },
    [data]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    axios.get(`/user/${username}`).then((resp) => setData(resp.data));
  }, [username, axios, isAuthenticated, navigate]);

  if (data === null) {
    return <></>;
  }

  return (
    <>
      <div className={styles.user}>
        <img
          className={styles.profilePicture}
          src={data.user.picture}
          alt="Profile pic"
        ></img>
        <span
          className={styles.username}
        >{`${data.user.username}'s latest beeps`}</span>
        <FollowButton
          followed={data.followed}
          visitedUserId={data.user.userId}
          follow={follow}
          unfollow={unfollow}
        />
      </div>
      {data &&
        data.beeps.map((beep) => (
          <BeepComponent
            beep={beep}
            likeToggler={likeToggler}
            key={beep.id}
          ></BeepComponent>
        ))}
    </>
  );
}

function FollowButton(props: {
  visitedUserId: string;
  followed: boolean;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
}) {
  const { user } = useAuth0();

  if (props.visitedUserId === user?.sub) {
    return <></>;
  }

  if (props.followed) {
    return (
      <button className={styles.followButton} onClick={props.unfollow}>
        Unfollow
      </button>
    );
  } else {
    return (
      <button className={styles.followButton} onClick={props.follow}>
        Follow
      </button>
    );
  }
}
