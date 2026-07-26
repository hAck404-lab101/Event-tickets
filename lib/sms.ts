export async function sendSMS(to: string, message: string) {
  const API_URL = "https://sms.gonlinesites.com/app/sms/api";
  const API_KEY = process.env.GONLINESITES_API_KEY;
  const SENDER_ID = process.env.GONLINESITES_SENDER_ID || "TixlyEvents";

  if (!API_KEY) {
    console.warn("SMS API key is not configured. Skipping SMS notification.");
    return null;
  }

  try {
    const params = new URLSearchParams({
      action: "send-sms",
      api_key: API_KEY,
      to: to,
      from: SENDER_ID,
      sms: message,
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET", // The API uses GET according to the documentation
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === "ok" || data.code === "OK") {
      console.log(`SMS Sent successfully! ID: ${data.message_id}`);
      return data;
    } else {
      console.error(`SMS Error ${data.code}: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return null;
  }
}
