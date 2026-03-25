import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const NOTION_VERSION = "2022-06-28";
const MAX_BLOCK_CHARS = 2000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

function chunkText(text, max = MAX_BLOCK_CHARS) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + max));
    i += max;
  }
  return chunks.length ? chunks : [""];
}

function richText(content) {
  return chunkText(content).map((c) => ({ type: "text", text: { content: c } }));
}

function buildBlocks(messages) {
  const blocks = [];
  for (const msg of messages) {
    const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: richText(`${role}:`) },
    });

    const content = msg.content || "";
    if (content.includes("```")) {
      const parts = content.split(/(```[\s\S]*?```)/g);
      for (const part of parts) {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          const lang = match?.[1] || "plain text";
          const code = match?.[2]?.trim() || "";
          blocks.push({
            object: "block",
            type: "code",
            code: {
              rich_text: richText(code),
              language: lang || "plain text",
            },
          });
        } else if (part.trim()) {
          for (const chunk of chunkText(part.trim())) {
            blocks.push({
              object: "block",
              type: "paragraph",
              paragraph: { rich_text: richText(chunk) },
            });
          }
        }
      }
    } else {
      for (const chunk of chunkText(content)) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: richText(chunk) },
        });
      }
    }
  }
  return blocks;
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/notion-proxy", async (req, res) => {
  const { token, databaseId, conversation, messages } = req.body ?? {};
  if (!token || !databaseId || !conversation || !Array.isArray(messages)) {
    res.status(400).json({ error: "Missing token, databaseId, conversation, or messages" });
    return;
  }

  const blocks = buildBlocks(messages);
  const dbId = String(databaseId).replace(/-/g, "");
  const props = {
    Name: {
      title: [{ type: "text", text: { content: (conversation.title || "Untitled").slice(0, 2000) } }],
    },
  };

  try {
    const createRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: props,
        children: blocks.slice(0, 100),
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      res.status(createRes.status).json({ error: err || "Notion API error" });
      return;
    }

    const page = await createRes.json();
    const pageId = page.id;
    const url = page.url ?? `https://notion.so/${pageId.replace(/-/g, "")}`;

    if (blocks.length > 100) {
      const rest = blocks.slice(100);
      const appendRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ children: rest }),
      });

      if (!appendRes.ok) {
        res.status(200).json({
          pageId,
          url,
          warning: "Page created but some content could not be appended",
        });
        return;
      }
    }

    res.status(200).json({ pageId, url });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.use(express.static(distDir));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
