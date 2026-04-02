export async function generateOverview(generateWithRotation, issue) {

  const prompt = `
Bạn là hệ thống đặt tiêu đề và tóm tắt vấn đề tranh luận.

Yêu cầu:
- Tạo 1 tiêu đề ngắn gọn, khái quát, sâu sắc (tối đa 12 từ)
- Tạo 1 đoạn tóm tắt 3-5 câu, bao quát cả hai hướng quan điểm
- Văn phong trung lập, học thuật, không cảm tính

Trả về JSON:

{
  "title": "...",
  "summary": "..."
}

Vấn đề:
${issue}
`;

  try {
    const raw = await generateWithRotation(prompt, true);
    console.log("Overview AI raw response:", raw);
    
    // Clean the response
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const json = JSON.parse(cleaned);

    return {
      title: json.title || "Debate",
      summary: json.summary || issue
    };
  } catch (err) {
    console.error("Overview generation error:", err);
    throw err;
  }
}
