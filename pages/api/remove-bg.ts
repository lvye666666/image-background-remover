import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "请提供图片数据（base64 或 URL）" });
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "服务器未配置 Remove.bg API Key" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append("image_file", new Blob([imageBuffer]), "image.png");
    formData.append("size", "auto");
    formData.append("format", "png");

    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      let errorMessage = "Remove.bg API 调用失败";
      try {
        const errBody = await removeBgResponse.json();
        errorMessage = errBody.errors?.[0]?.title || errorMessage;
      } catch {
        // ignore parse error
      }
      return res.status(removeBgResponse.status).json({ error: errorMessage });
    }

    const resultBuffer = await removeBgResponse.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString("base64");
    const resultDataUrl = `data:image/png;base64,${resultBase64}`;

    return res.status(200).json({ result: resultDataUrl });
  } catch (error) {
    console.error("[/api/remove-bg]", error);
    return res.status(500).json({ error: "服务器内部错误，请稍后重试。" });
  }
}
