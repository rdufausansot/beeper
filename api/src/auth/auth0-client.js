import { ManagementClient } from "auth0";
import camelcaseKeys from "camelcase-keys";

const auth0ApiClient = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: "read:users",
});

export class UsernameNotFound extends Error {}

export async function getAuth0UsersByIds(ids) {
  return await getNormalizedUsers({
    q: ids.map((id) => `user_id:${id}`).join(" OR "),
  });
}

export async function getAuth0UserByUsername(username) {
  const matchingUsers = await getNormalizedUsers({
    q: `username:${username}`,
  }); // /!\ since the username parameter is provided by users, there's probably room for query injection here

  if (matchingUsers.length === 0) {
    throw new UsernameNotFound(username);
  }

  if (matchingUsers.length > 1) {
    throw new Error("Unexpected state: usernames should be unique");
  }

  return matchingUsers[0];
}

/*
 * Wrapper around Auth0's getUsers that:
 *   1. normalizes the keys to camel case
 *   2. only keeps the fields that we actually want to expose to API clients
 */
async function getNormalizedUsers(params) {
  const fullUsers = await auth0ApiClient.getUsers(params);

  const camelCaseFullUsers = camelcaseKeys(fullUsers);

  return camelCaseFullUsers.map((fullUser) => ({
    userId: fullUser.userId,
    username: fullUser.username,
    picture: fullUser.picture,
  }));
}
