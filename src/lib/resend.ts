import { Resend } from "resend";

// ✅ Replace with your actual Resend API key
const resend = new Resend("re_KMR67wm..."); // <-- Your API Key here

/**
 * Send shipping notification email
 */
export const sendTrackingEmail = async ({
  to,
  order_id,
  tracking_id,
  courier,
  estimated_date,
}: {
  to: string;
  order_id: string;
  tracking_id: string;
  courier: string;
  estimated_date: string;
}) => {
  try {
    const { error } = await resend.emails.send({
      from: "Cauvery Store <onboarding@resend.dev>",
      to,
      subject: "Your Order Has Been Shipped",
      html: `
        <p>Hi,</p>
        <p>Your order <strong>#${order_id}</strong> has been shipped!</p>
        <ul>
          <li>📦 <strong>Tracking ID:</strong> ${tracking_id}</li>
          <li>🚚 <strong>Courier:</strong> ${courier}</li>
          <li>📅 <strong>Estimated Delivery:</strong> ${estimated_date}</li>
        </ul>
        <p>Thank you for shopping with Cauvery Store!</p>
      `,
    });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Resend error (shipping):", e);
    return false;
  }
};

/**
 * Send cancellation notification email
 */
export const sendCancelEmail = async ({
  to,
  order_id,
}: {
  to: string;
  order_id: string;
}) => {
  try {
    const { error } = await resend.emails.send({
      from: "Cauvery Store <onboarding@resend.dev>",
      to,
      subject: "Your Order Has Been Cancelled",
      html: `
        <p>Hi,</p>
        <p>Your order <strong>#${order_id}</strong> has been successfully cancelled.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>– Team Cauvery Store</p>
      `,
    });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Resend error (cancel):", e);
    return false;
  }
};
export const notifyAdminOfReturnRequest = async ({
  order_id,
  request_type,
  reason,
}: {
  order_id: number;
  request_type: string;
  reason: string;
}) => {
  try {
    const { error } = await resend.emails.send({
      from: "Cauvery Store <onboarding@resend.dev>",
      to: "support@cauverystore.in", // or your Gmail
      subject: "New Return/Replace Request",
      html: `
        <p>A customer submitted a new request:</p>
        <ul>
          <li><strong>Order ID:</strong> ${order_id}</li>
          <li><strong>Type:</strong> ${request_type}</li>
          <li><strong>Reason:</strong> ${reason}</li>
        </ul>
      `,
    });

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Resend error (notify admin):", e);
    return false;
  }
  };
