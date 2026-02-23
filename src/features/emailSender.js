import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
import { pool } from "../db.js";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifySubscribers(params) {

    try {
    const emails = await pool.query(
        `SELECT email FROM subscribers`
    )

    console.log(emails)

    const { data, error } = await resend.emails.send({
    from: 'Johnny <gazdagbal@gmail.com>',
    to: emails,
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });
    } catch (error) {
        
    }
    

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}