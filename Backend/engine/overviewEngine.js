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

  const raw = await generateWithRotation(prompt, true);

  const json = JSON.parse(raw);

  return {
    title: json.title || "Debate",
    summary: json.summary || issue
  };
}