import { deleteLike, insertLike } from "../db/like.js";

export class BeepNotFoundError extends Error {}

export async function like(userId, beepId) {
  await insertLike(userId, beepId);
}

export async function unlike(userId, beepId) {
  await deleteLike(userId, beepId);
}
