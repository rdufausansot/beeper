import { getAuth0UsersByIds } from "../auth/auth0-client.js";
import { insertBeep } from "../db/insert-beep.js";

const BEEP_MAX_LENGTH = 280;

export class BeepTooLongError extends Error {}

export async function postBeep(userId, content) {
  if (content.length > BEEP_MAX_LENGTH) {
    throw new BeepTooLongError();
  }

  const insertedBeep = await insertBeep(userId, content);

  const [user] = await getAuth0UsersByIds([userId])

  return {
    ...insertedBeep,
    author: user
    };
}