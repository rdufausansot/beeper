import { queryNormalized } from "./connection-pool.js";

export async function insertFollow(followerId, followeeId) {
  await queryNormalized(
    "INSERT INTO follow (follower, followee) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [followerId, followeeId]
  );
}

export async function deleteFollow(followerId, followeeId) {
  await queryNormalized(
    "DELETE FROM follow WHERE follower = $1 AND followee = $2",
    [followerId, followeeId]
  );
}
