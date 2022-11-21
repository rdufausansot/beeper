import { getAuth0UsersByIds } from "../auth/auth0-client.js";
import { deleteFollow, insertFollow } from "../db/follow.js";

export class UserIdNotFound extends Error {}

export async function follow(followerId, followeeId) {
  const users = await getAuth0UsersByIds([followeeId]);

  if (users.length === 0) {
    throw new UserIdNotFound();
  }

  await insertFollow(followerId, followeeId);
}

export async function unfollow(followerId, followeeId) {
  const users = await getAuth0UsersByIds([followeeId]);

  if (users.length === 0) {
    throw new UserIdNotFound();
  }

  await deleteFollow(followerId, followeeId);
}
