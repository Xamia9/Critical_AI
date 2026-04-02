export function getMindmapRolePrompt(roleName, task, mindmapText, attemptNumber) {

  const roleDescriptions = {
    realist: `
Bạn theo tư duy HIỆN THỰC.
Tập trung: tính khả thi, rủi ro, giới hạn nguồn lực, hệ quả thực tế.
Tránh lý tưởng hóa.
`,
    visionary: `
Bạn theo tư duy TẦM NHÌN.
Tập trung: tác động dài hạn, đổi mới, tiềm năng phát triển.
Khuyến khích mở rộng tư duy nhưng vẫn logic.
`,
    skeptic: `
Bạn theo tư duy HOÀI NGHI.
Tập trung: lỗ hổng logic, giả định ẩn, thiếu bằng chứng, thiên kiến.
Phản biện sắc bén nhưng khách quan.
`
  };

  return `
CHỦ ĐỀ:
"${task}"

SƠ ĐỒ TƯ DUY:
${mindmapText}

Lần phản hồi: ${attemptNumber}/3

${roleDescriptions[roleName]}

NHIỆM VỤ:
1) Đánh giá cấu trúc lập luận (claim → reason → evidence → implication).
2) Phân tích ngầm theo 8 yếu tố tư duy:
   - Mục đích (purpose)
   - Câu hỏi trung tâm (question)
   - Thông tin sử dụng (information)
   - Suy luận/kết luận (inference)
   - Khái niệm nền tảng (concepts)
   - Giả định ẩn (assumptions)
   - Hệ quả (implications)
   - Quan điểm (point of view)

Chỉ ra:
- Điểm hợp lý
- Điểm thiếu logic
- Giả định ẩn
- Yếu tố tư duy còn yếu hoặc thiếu
- Mức độ nhất quán giữa các nhánh

QUY TẮC TRÌNH BÀY:
- Tối đa 10 bullet.
- Mỗi bullet tối đa 2 dòng.
- Không viết đoạn văn dài.
- Không viết lại nội dung người dùng.
- Không tạo lập luận mới hoàn chỉnh.
- Phải bắt đầu bằng "- " cho mỗi bullet.
- Không viết chữ "TRẢ LỜI THEO MẪU" trong phản hồi.
- Trả lời càng ngắn gọn càng tốt.

TRẢ LỜI THEO MẪU:

Điểm Mạnh:
  - ...
  - ...

Lỗ Hổng Chính:
  - ...
  - ...

Giả Định Ẩn/ Thiếu Bằng Chứng:
  - ...
  - ...

Góc Nhìn Còn Thiếu:
  - ...
  - ...

Hướng Cải Thiện:
  - ...
  - ...

Nếu là lần 3:
→ Phân tích sâu hơn
→ Chỉ ra lỗi tinh vi
→ Tập trung vào cấu trúc tổng thể
`;
}