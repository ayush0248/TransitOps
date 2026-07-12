import nodemailer from "nodemailer";

let testAccount: nodemailer.TestAccount | null = null;
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Generate a test account dynamically if not provided in ENV
  if (!process.env.SMTP_HOST) {
    console.log("No SMTP credentials provided. Generating Ethereal Email test account...");
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendLicenseExpiryWarning(
  driverName: string,
  driverEmail: string | null,
  safetyOfficerEmails: string[],
  daysRemaining: number,
  expiryDate: Date
) {
  const mailer = await getTransporter();

  const recipients = [...safetyOfficerEmails];
  if (driverEmail) {
    recipients.push(driverEmail);
  }

  if (recipients.length === 0) {
    console.log(`[Email Service] No recipients found for driver ${driverName} expiry warning.`);
    return;
  }

  const isExpired = daysRemaining < 0;
  const statusText = isExpired ? "EXPIRED" : "EXPIRING SOON";
  const daysText = isExpired ? `expired ${Math.abs(daysRemaining)} days ago` : `will expire in ${daysRemaining} days`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
      <div style="background-color: ${isExpired ? '#ef4444' : '#f59e0b'}; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">TransitOps Compliance Alert</h2>
        <p style="color: white; margin-top: 5px; opacity: 0.9;">Driver License ${statusText}</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #3f3f46;">Hello,</p>
        <p style="font-size: 16px; color: #3f3f46;">
          This is an automated compliance alert from TransitOps. The commercial driver's license for <strong>${driverName}</strong> ${daysText}.
        </p>
        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #52525b; font-family: monospace;"><strong>Driver Name:</strong> ${driverName}</p>
          <p style="margin: 5px 0 0; color: #52525b; font-family: monospace;"><strong>Expiration Date:</strong> ${expiryDate.toLocaleDateString()}</p>
        </div>
        <p style="font-size: 14px; color: #71717a;">
          ${isExpired 
            ? "IMMEDIATE ACTION REQUIRED. This driver is currently out of compliance and should be suspended from active dispatching until the license is renewed." 
            : "Please ensure the driver submits their renewed license documentation before the expiration date to avoid dispatch suspension."}
        </p>
        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
        <p style="font-size: 12px; color: #a1a1aa; text-align: center;">
          TransitOps OS Platform - Automated Safety & Compliance Module
        </p>
      </div>
    </div>
  `;

  const info = await mailer.sendMail({
    from: '"TransitOps Safety" <safety@transitops.local>',
    to: recipients.join(", "),
    subject: `[CRITICAL] License Expiry Warning - ${driverName}`,
    html: htmlBody,
  });

  console.log(`[Email Service] Expiry warning sent for ${driverName} to: ${recipients.join(", ")}`);
  
  if (testAccount) {
    console.log(`[Ethereal] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  }

  return { success: true, previewUrl: null };
}
