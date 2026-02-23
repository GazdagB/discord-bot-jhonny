import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
import { pool } from "../db.js";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifySubscribers() {
    try {
        const result = await pool.query(`SELECT email FROM subscribers`);
        const emails = result.rows.map(row => row.email);

        if (emails.length === 0) return;

        const { data, error } = await resend.emails.send({
            from: 'Johnny Bot <johnny@gazdag.studio>',
            to: emails,
            subject: 'Hello World',
            html: '<strong>It works!</strong>',
        });

        if (error) {
            return console.error({ error });
        }

        console.log({ data });
    } catch (error) {
        console.error('notifySubscribers error:', error);
    }
}