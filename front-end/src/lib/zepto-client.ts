/// <reference path="../zeptomail.d.ts" />
import { SendMailClient } from "zeptomail";

const url = process.env.ZEPTOMAIL_URL || "api.zeptomail.in/";
const token = process.env.ZEPTOMAIL_TOKEN || "";

export const getZeptoMailClient = () => {
    return new SendMailClient({ url, token });
};

export const sendOTPEmail = async (to: string, otp: string) => {
    const client = getZeptoMailClient();

    try {
        await client.sendMail({
            from: {
                address: "noreply@avocodos.com",
                name: "Avocodos"
            },
            to: [
                {
                    email_address: {
                        address: to,
                        name: to.split("@")[0]
                    }
                }
            ],
            subject: "Verify Your Email - Avocodos",
            htmlbody: `
        <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Archivo', sans-serif;
                color: #333;
                line-height: 1.6;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #fcfcfc;
                border-radius: 30px;
                padding: 36px;
                box-shadow: 0 2px 24px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #2c3e50;
                font-size: 28px;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 15px;
              }
              .otp-container {
              	width: 100%;
              margin: auto;
              }
              * {
              	color: #1a1a1a;
              }

              .otp {
                font-size: 24px;
                font-weight: 800;
                color: #1a1a1a;
                background-color: #fafafa;
                padding: 5px 20px;
              border-style: solid;
              border-color: #1a1a1a;
                border-radius: 10px;
                display: inline-block;
              display: flex;
              justify-content: center;

              }
              .footer {
                font-size: 14px;
                color: #7f8c8d;
                margin-top: 30px;
              	text-balance: balance;
              text-align: center;
              max-width: 300px;
              margin-left: auto;
              margin-right: auto;
              }
              h1 {
              	font-weight: 800;
              letter-spacing: -1px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="https://avocodos-web.vercel.app/auth.webp" alt="Avocodos Logo" style="width: 100%; display: block; margin: 0 auto 30px; border-radius: 20px;">
              <h1>Welcome to Avocodos!</h1>
              <p>We're thrilled to have you join our <strong>Avocodos community</strong>! 🎉 Your journey into the world of web3-based social media and learning starts here. We can't wait for you to experience our innovative platform.</p>
              <p>To get started, please verify your email address using the following OTP:</p>
              <div class="otp-container">
				<p class="otp">${otp}</p>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>, so make sure to use it before it expires.</p>
              <p>Once verified, you'll have full access to our platform, where you can:</p>
              <ul>
                <li><strong>Create and share posts</strong> with the community</li>
                <li>Discover, join, and create <strong>unique communities</strong></li>
                <li>Follow and connect with <strong>like-minded individuals</strong></li>
                <li>Engage in <strong>direct messaging</strong> with other users</li>
                <li>Access a wealth of <strong>learning resources and experiences</strong></li>
                <li>Access and purchase our official courses. Upon course completion, you will be granted with a <strong>free limited edition minted NFT</strong> and certification from our team on the Aptos network.</li>
              </ul>
              <p>Welcome to the future of social interaction and learning in the web3 space!</p>
              <p>Get ready for an exciting, decentralized, and innovative experience!</p>
              <p>Best regards,<br>The Avocodos Team</p>
              <p class="footer">If you didn't request this email, please ignore it. Your account security is important to us.</p>
            </div>
          </body>
        </html>
      `,
        });
        return true;
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        return false;
    }
};