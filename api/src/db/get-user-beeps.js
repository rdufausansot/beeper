import { queryNormalized } from "./connection-pool.js";

export async function getUserBeeps(userId) {
  return await queryNormalized(
    "SELECT * FROM beep WHERE author_id = $1 ORDER BY created_at DESC LIMIT 10",
    [userId]
  );
}
