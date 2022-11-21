import { queryNormalized } from "./connection-pool.js";

export async function getHomeBeeps(userId) {
  return await queryNormalized(
    `
    SELECT 
      beep.id,
      author_id, 
      created_at, 
      content,
      like_count,
      liked.id IS NOT NULL AS "liked"
    FROM 
      beep 
      JOIN follow ON author_id = followee AND follower = $1
      LEFT JOIN liked ON beep.id = liked.beep_id AND liker_id = $1
    UNION 
    SELECT
      beep.id, 
      author_id, 
      created_at, 
      content,
      like_count,
      liked.id IS NOT NULL AS "liked"
    FROM 
      beep
      LEFT JOIN liked ON beep.id = liked.beep_id AND liker_id = $1
    WHERE 
      author_id = $1
    ORDER BY 
      created_at DESC 
    LIMIT 
      10
    `,
    [userId]
  );
}
