import { getAuth0UsersByIds } from "../auth/auth0-client.js";
import { getHomeBeeps } from "../db/get-home-beeps.js";
import { mergeBeepsAuthors } from "../utils/merge-beeps-authors.js";

export async function getUserHome(userId) {
  const beeps = await getHomeBeeps(userId);

  const users = await getAssociatedUsers(beeps);

  mergeBeepsAuthors(beeps, users);

  return beeps;
}

async function getAssociatedUsers(beeps) {
  const authorIds = beeps.map((beep) => beep.authorId);
  return await getAuth0UsersByIds(authorIds);
}