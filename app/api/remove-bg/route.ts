import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "请提供图片数据（base64 或 URL）" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "服务器未配置 Remove.bg API Key，请联系管理员。" },
        { status: 500 }
      );
    }

    // Convert data URL to base64 raw string (strip data:image/xxx;base64, prefix)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Call Remove.bg API
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
      return NextResponse.json({ error: errorMessage }, { status: removeBgResponse.status });
    }

    // Return the resulting PNG as base64 data URL
    const resultBuffer = await removeBgResponse.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString("base64");
    const resultDataUrl = `data:image/png;base64,${resultBase64}`;

    return NextResponse.json({ result: resultDataUrl });
  } catch (error) {
    console.error("[/api/remove-bg]", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试。" },
      { status: 500 }
    );
  }
}
