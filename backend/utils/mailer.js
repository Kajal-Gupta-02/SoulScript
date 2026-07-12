const SENDER_EMAIL = process.env.EMAIL_USER;
const SENDER_NAME = "SoulScript";

async function sendNewPostEmail(subscriber, post) {
  const unsubscribeUrl = `${process.env.SITE_URL}/unsubscribe/${subscriber.unsubscribeToken}`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: subscriber.email }],
      subject: `New post: ${post.title}`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color:#204E57;">${post.title}</h2>
          <p style="color:#33474A;">${post.excerpt || "A new post just went up on SoulScript."}</p>
          <a href="${process.env.SITE_URL}/post/${post.slug}"
             style="display:inline-block; background:#EF8FA8; color:white; padding:10px 20px; border-radius:999px; text-decoration:none; margin-top:10px;">
            Read it
          </a>
          <p style="font-size:12px; color:#999; margin-top:30px;">
            Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe here</a>.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${errText}`);
  }
}

async function notifyAllSubscribers(post, Subscriber) {
  const subscribers = await Subscriber.find();
  for (const subscriber of subscribers) {
    try {
      await sendNewPostEmail(subscriber, post);
    } catch (err) {
      console.error(`Could not email ${subscriber.email}:`, err.message);
    }
  }
}

module.exports = { notifyAllSubscribers };