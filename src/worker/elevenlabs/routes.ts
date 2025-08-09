import { Hono } from "hono";

const elevenLabsRoutes = new Hono();

// Handle CORS preflight requests
elevenLabsRoutes.options("/conversationtoken", async (c) => {
  const origin = c.req.header("Origin");
  if (origin && origin.endsWith(".ctrip.com")) {
    c.header("Access-Control-Allow-Origin", origin);
  }
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.text("", 200);
});

elevenLabsRoutes.post("/conversationtoken", async (c) => {
  const { apiKey, agentId } = await c.req.json();
  
  // Set CORS headers for *.ctrip.com
  const origin = c.req.header("Origin");
  if (origin && origin.endsWith(".ctrip.com")) {
    c.header("Access-Control-Allow-Origin", origin);
  }
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  
  try{
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
    {
      headers: {
        // Requesting a conversation token requires your ElevenLabs API key
        // Do NOT expose your API key to the client!
        "xi-api-key": apiKey,
      }
    }
  );
  if (!response.ok) {
    return c.json({ error: "Failed to get conversation token" }, 500);
  }
    const body = await response.json() as { token: string };
    return c.json({ token: body.token } );
  } catch (error) {
    return c.json({ error: "Failed to get conversation token" }, 500);
  }
});

export { elevenLabsRoutes };