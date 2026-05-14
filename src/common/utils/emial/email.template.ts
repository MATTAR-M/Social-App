

export const emailTemplate = (otp:number) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 500px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            }
            .header {
                background-color: #1ebba3; /* Social App's signature teal */
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                letter-spacing: 1px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #333333;
                letter-spacing: 8px;
                margin: 25px 0;
                padding: 15px;
                background-color: #f9f9f9;
                border: 1px dashed #1ebba3;
                display: inline-block;
                border-radius: 8px;
            }
            .footer {
                background-color: #f9f9f9;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #888888;
            }
            p {
                color: #555555;
                line-height: 1.6;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Social App</h1>
            </div>
            <div class="content">
                <h2 style="color: #333;">Verification Code</h2>
                <p>To keep your secrets safe and secure, please use the following One-Time Password (OTP) to complete your login:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p style="font-size: 13px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                &copy; 2026 Social App. Honesty starts here.<br>
                <a href="#" style="color: #1ebba3; text-decoration: none;">Privacy Policy</a> | <a href="#" style="color: #1ebba3; text-decoration: none;">Support</a>
            </div>
        </div>
    </body>
    </html>`
}
