import { Hono } from "hono";
import { HuggingFaceScraper } from "./huggingface/dailypapers";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/huggingface/dailypapers", async (c) => {
    const scraper = new HuggingFaceScraper();
    const papers = await scraper.fetchPapers(c);
    return c.json(papers);
});

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

export default app;

