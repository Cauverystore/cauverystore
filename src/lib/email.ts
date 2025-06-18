// src/lib/email.ts
import emailjs from "@emailjs/browser";

export const sendTrackingEmail = async ({
  user_email,
  order_id,
  tracking_id,
  courier,
  estimated_date,
}: {
  user_email: string;
  order_id: string;
  tracking_id: string;
  courier: string;
  estimated_date: string;
}) => {
  try {
    await emailjs.send(
      "service_zqj3mb1", // replace
      "template_l88b1jk",
", // replace
      {
        user_email,
        order_id,
        tracking_id,
        courier,
        estimated_date,
      },
      "BKpeBg6p3n0aHgNeI" // replace
    );
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
