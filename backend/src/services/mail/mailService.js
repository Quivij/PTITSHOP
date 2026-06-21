import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendMail(to, subject, templateName, data) {
        try {
            // Render EJS template
            const templatePath = path.join(__dirname, "../../views/emails", templateName);
            const html = await ejs.renderFile(templatePath, data);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                html
            };

            // Fallback for development without email credentials
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log("=========================================");
                console.log("Mock Email Sent (No EMAIL_USER in .env)!");
                console.log(`To: ${to}`);
                console.log(`Subject: ${subject}`);
                console.log(`Data:`, data);
                console.log("=========================================");
                return;
            }

            await this.transporter.sendMail(mailOptions);
            console.log(mailOptions);
            console.log(`Mail sent to ${to}`);
        } catch (error) {
            console.error("Error sending mail:", error);
            throw error;
        }
    }

    async sendOrderSuccessEmail(user, order, shopUrl = "http://localhost:3000") {
        try {
            const subject = `Cảm ơn bạn đã đặt hàng tại PtitShop - Đơn hàng #${order._id}`;
            const data = {
                user,
                order,
                shopUrl
            };

            await this.sendMail(user.email, subject, "order-success.ejs", data);
            console.log(`Order success email sent to ${user.email}`);
        } catch (error) {
            console.error("Error sending order success email:", error);
            throw error;
        }
    }

    async sendReviewSuccessEmail(user, review, product, reward, shopUrl = "http://localhost:3000") {
        try {
            const subject = `Cảm ơn bạn đã đánh giá sản phẩm tại PtitShop`;
            const data = {
                user,
                review,
                product,
                reward,
                shopUrl
            };

            await this.sendMail(user.email, subject, "review-success.ejs", data);
            console.log(`Review success email sent to ${user.email}`);
        } catch (error) {
            console.error("Error sending review success email:", error);
            throw error;
        }
    }
}

export default new MailService();
