import pg from "pg";
const {Pool} = pg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});




export async function initDB(){
      await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      discord_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('✅ Database ready!');
}

export async function saveSubscriber(discordId, email){
    await pool.query(
    `INSERT INTO subscribers (discord_id, email) 
       VALUES ($1, $2) 
     ON CONFLICT (discord_id) DO UPDATE SET email = $2`,
    [discordId, email]
    )
}

export async function unsubscribeEmail(discordId){
    await pool.query(
        `DELETE FROM subscribers 
       WHERE discord_id = $1`,
    [discordId]
    )
    
}

export {pool}