import { pool } from "./connection-pool.js";

export async function doesUserFollow(followerId, followeeId) {
  const res = await pool.query(
    `SELECT 1 FROM follow WHERE follower = $1 AND followee = $2`,
    [followerId, followeeId]
  );

  return res.rows.length > 0;
}
