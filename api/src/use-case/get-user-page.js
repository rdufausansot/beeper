import { getAuth0UserByUsername } from "../auth/auth0-client.js";
import { doesUserFollow } from "../db/follows.js";
import { getUserBeeps } from "../db/get-user-beeps.js";
import { mergeBeepsAuthors } from "../utils/merge-beeps-authors.js";

export async function getUserPageByUsername(requesterId, username) {
  const user = await getAuth0UserByUsername(username);

  const beeps = await getUserBeeps(user.userId);
  mergeBeepsAuthors(beeps, [user]);

  const followed = await doesUserFollow(requesterId, user.userId);

  return { user, beeps, followed };
}
