import nodemailer from "nodemailer";
import logger from "../utils/logger";

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    try {
      // Gmail configuration
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for the other ports.
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use App Password for Gmail
        },
      });
      // Alternative configuration for other SMTP providers
      //this.transporter = nodemailer.createTransport({
      // service: 'gmail',
      // host: process.env.SMTP_HOST,
      // port: process.env.PORT,
      // secure: false, // true for 465, false for the other ports.
      //auth: {
      // user: process.env.EMAIL_USER,
      // pass: process.env.EMAIL_PASS // Use App Password for Gmail
      // }
      //})
      logger.info("Email transporter initialized successfully");
    } catch (error) {
      logger.error(`Failed to initialize email transporter: ${error.message}`);
      throw error;
    }
  }

  // Verify email configuration
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("Email service connection verified");
      return true;
    } catch (error) {
      logger.error(`Email service verification failed: ${error.message}`);
      return false;
    }
  }

  // Send basic email
  async sendEmail(to, subject, text, html = null) {
    try {
      const mailOptions = {
        from: {
          name: process.env.APP_NAME || "AI Resume Analyzer",
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        },
        to,
        subject,
        text,
        html: html || text,
      };
      const result = await this.transporter.sendMail(mailOptions);
      logger.success(`Email sent successfully to ${to}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail, userName) {
    const subject = "Welcome to AI Resume Analyser!";
    const html = `
     <!DOCTYPE html>
     <html>
     <head>
      <style>
       .email-containter{font-family: Arial, sans-serif; max-width:600px; margin: 0 auto;}
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .btn { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
       </style>
       </head>
       <body>
        <div class="email-container">
         <div class="header">
          <h1>Welcome to AI Resume Analyzer! </h1>
          <p>Your intelligent career companion </p>
          </div> 
          <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for joining AI Resume Analyzer. We're excited to help you optimize your resume and advance your career!</p>
              
              <div class="features">
                <h3>🚀 What you can do:</h3>
                <ul>
                  <li>📄 Upload and analyze your resume with AI</li>
                  <li>💡 Get personalized improvement suggestions</li>
                  <li>📊 Receive detailed performance scores</li>
                  <li>🎯 Match your skills with job requirements</li>
                  <li>📈 Track your progress over time</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/dashboard" class="btn">
                  Get Started Now
                </a>
              </div>

              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The AI Resume Analyzer Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AI Resume Analyzer. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Password Reset Request - AI Resume Analyzer
      
      Hello ${userName}!
      
      We received a request to reset your password for your AI Resume Analyzer account.
      
      Reset your password: ${resetUrl}
      
      Important:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - For security, never share this link with anyone
      
      Best regards,
      The AI Resume Analyzer Team
    `;
    return await this.sendEmail(userEmail, subject, text, html);
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;
    const subject = `Reset Your Password - AI Resume Analyzer`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
            .btn { background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>We received a request to reset your password for your AI Resume Analyzer account.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="btn">Reset Your Password</a>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>For security, never share this link with anyone</li>
                </ul>
              </div>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>

              <p>Best regards,<br>The AI Resume Analyzer Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AI Resume Analyzer. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    const text = `
      Password Reset Request - AI Resume Analyzer
      
      Hello ${userName}!
      
      We received a request to reset your password for your AI Resume Analyzer account.
      
      Reset your password: ${resetUrl}
      
      Important:
      - This link will expire in 1 hour
      - If you didn't request this reset, please ignore this email
      - For security, never share this link with anyone
      
      Best regards,
      The AI Resume Analyzer Team
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  // Email verification
  async sendEmailVerification(userEmail, userName, verificationToken) {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${verificationToken}`;
    const subject = "Please Verify Your Email - AI Resume Analyzer";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #2ecc71; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
            .btn { background: #2ecc71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Please verify your email address to complete your registration and start using AI Resume Analyzer.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="btn">Verify Email Address</a>
              </div>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>

              <p>If you didn't create this account, please ignore this email.</p>

              <p>Best regards,<br>The AI Resume Analyzer Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AI Resume Analyzer. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Please Verify Your Email - AI Resume Analyzer
      
      Hello ${userName}!
      
      Please verify your email address to complete your registration and start using AI Resume Analyzer.
      
      Verify your email: ${verificationUrl}
      
      If you didn't create this account, please ignore this email.
      
      Best regards,
      The AI Resume Analyzer Team
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  // Resume analysis completion notification
  async sendAnalysisCompleteEmail(userEmail, userName, analysisResults) {
    const dashboardUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/dashboard`;
    const subject = "🎉 Your Resume Analysis is Complete!";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
            .btn { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
            .results { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .score { font-size: 24px; font-weight: bold; color: #2ecc71; text-align: center; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🎉 Analysis Complete!</h1>
              <p>Your AI-powered resume analysis is ready</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Great news! Your resume analysis has been completed. Here's a quick summary:</p>
              
              <div class="results">
                <div class="score">Overall Score: ${
                  analysisResults.overallScore || "N/A"
                }/100</div>
                <h3>📊 Key Insights:</h3>
                <ul>
                  <li>📝 Content Quality: ${
                    analysisResults.contentScore || "N/A"
                  }/100</li>
                  <li>🎨 Format & Structure: ${
                    analysisResults.formatScore || "N/A"
                  }/100</li>
                  <li>🔍 ATS Compatibility: ${
                    analysisResults.atsScore || "N/A"
                  }/100</li>
                  <li>💡 Suggestions: ${
                    analysisResults.suggestionCount || 0
                  } improvements identified</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="btn">View Full Analysis</a>
              </div>

              <p>Log in to your dashboard to see detailed recommendations and start improving your resume today!</p>
              
              <p>Best regards,<br>The AI Resume Analyzer Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AI Resume Analyzer. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Your Resume Analysis is Complete! - AI Resume Analyzer
      
      Hello ${userName}!
      
      Great news! Your resume analysis has been completed.
      
      Results Summary:
      - Overall Score: ${analysisResults.overallScore || "N/A"}/100
      - Content Quality: ${analysisResults.contentScore || "N/A"}/100
      - Format & Structure: ${analysisResults.formatScore || "N/A"}/100
      - ATS Compatibility: ${analysisResults.atsScore || "N/A"}/100
      - Suggestions: ${
        analysisResults.suggestionCount || 0
      } improvements identified
      
      View full analysis: ${dashboardUrl}
      
      Best regards,
      The AI Resume Analyzer Team
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  // Contact form submission notification
  async sendContactFormEmail(contactData) {
    const subject = `New Contact Form Submission - ${contactData.subject}`;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #3498db; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>📩 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="info-row"><strong>Name:</strong> ${
                contactData.name
              }</div>
              <div class="info-row"><strong>Email:</strong> ${
                contactData.email
              }</div>
              <div class="info-row"><strong>Subject:</strong> ${
                contactData.subject
              }</div>
              <div class="info-row"><strong>Message:</strong><br>${
                contactData.message
              }</div>
              <div class="info-row"><strong>Date:</strong> ${new Date().toLocaleString()}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail(adminEmail, subject, contactData.message, html);
  }

  // Send bulk emails (for newsletters, announcements)
  async sendBulkEmail(recipients, subject, text, html) {
    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(
          recipient.email,
          subject,
          text,
          html
        );
        results.push({
          email: recipient.email,
          success: true,
          messageId: result.messageId,
        });

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(
          `Failed to send bulk email to ${recipient.email}: ${error.message}`
        );
        results.push({
          email: recipient.email,
          success: false,
          error: error.message,
        });
      }
    }

    logger.info(
      `Bulk email completed. Sent: ${
        results.filter((r) => r.success).length
      }, Failed: ${results.filter((r) => !r.success).length}`
    );
    return results;
  }
}

// Create and export singleton instance
const emailService = new EmailService();

export default emailService;
