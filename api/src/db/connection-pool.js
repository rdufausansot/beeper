import pg from "pg";
import camelcaseKeys from "camelcase-keys";

// pools will use environment variables
// for connection information
export const pool = new pg.Pool();

export async function queryNormalized(...args) {
  const res = await pool.query(...args);
  return camelcaseKeys(res.rows);
}