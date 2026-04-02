export function buildSimulationPrompt(decision, mindmaps) {
  return `
Bạn là chuyên gia mô phỏng và giám khảo tư duy phản biện theo mô hình Paul–Elder (9 tiêu chuẩn trí tuệ).

DỮ LIỆU:

QUYẾT ĐỊNH CUỐI:
${JSON.stringify(decision, null, 2)}

3 SƠ ĐỒ TƯ DUY:
${JSON.stringify(mindmaps, null, 2)}

NHIỆM VỤ:

PHẦN A — MÔ PHỎNG HỆ QUẢ
1. Kết quả ngắn hạn
2. Kết quả dài hạn
3. Rủi ro tiềm ẩn
4. Mâu thuẫn logic còn tồn tại

(Lưu ý: trình bày ngắn gọn nhất có thể)

PHẦN B — CHẤM ĐIỂM THEO 9 TIÊU CHUẨN TRÍ TUỆ (0–10 mỗi mục)

Chấm điểm theo thang:

0–2  = Rất yếu / Gần như không có
3–4  = Yếu / Nhiều thiếu sót rõ ràng
5–6  = Trung bình / Đủ dùng nhưng còn hạn chế
7–8  = Tốt / Ít lỗi, lập luận khá vững
9    = Rất tốt / Rõ ràng, sâu sắc, có cân nhắc đa chiều
10   = Xuất sắc / Gần như không có điểm yếu đáng kể

Tiêu chí cụ thể:

1. clarity
- Lập luận có dễ hiểu không?
- Có mơ hồ hoặc nước đôi không?

2. accuracy
- Có dựa trên thông tin hợp lý không?
- Có suy diễn thiếu căn cứ không?

3. precision
- Có đủ cụ thể không?
- Hay chỉ nói chung chung?

4. relevance
- Có tập trung vào đúng vấn đề chính không?
- Có lan man không cần thiết không?

5. depth
- Có xử lý được sự phức tạp không?
- Hay chỉ phân tích bề mặt?

6. breadth
- Có xem xét góc nhìn khác không?
- Có thiên về một phía?

7. logic
- Các phần có nhất quán với nhau không?
- Có mâu thuẫn nội bộ không?

8. significance
- Có tập trung vào yếu tố quan trọng nhất không?
- Hay sa vào chi tiết thứ yếu?

9. fairness
- Có đánh giá khách quan không?
- Có thiên kiến cảm xúc hoặc định kiến không?

LƯU Ý:
- Không được chấm 9–10 nếu vẫn còn mâu thuẫn hoặc giả định yếu.
- Không được chấm trên 7 nếu thiếu bằng chứng rõ ràng.
- Phải phân hóa điểm, tránh cho tất cả tiêu chí cùng mức.

PHẦN C — ĐIỂM MẠNH & YẾU
- Điểm mạnh: ít nhất 1, tối đa 3 bullet.
- Điểm yếu: ít nhất 1, tối đa 3 bullet.
- Bullet ngắn gọn, tối đa 2 dòng.

QUY TẮC CỰC KỲ QUAN TRỌNG:

- Mỗi mục hậu quả tối đa 4 bullet.
- Mỗi mục là một array.
- Mỗi phần tử trong array là một chuỗi.
- Không dùng xuống dòng trong string.
- Mỗi bullet tối đa 2 dòng.
- Điểm phải là số nguyên 0–10.
- strengths và weaknesses tối đa 3 bullet.
- Trả về đúng JSON.
- Không markdown.
- Không giải thích.
- Không thêm chữ ngoài JSON.

FORMAT BẮT BUỘC:

{
  "consequences": {
    "shortTerm": [],
    "longTerm": [],
    "risks": [],
    "conflicts": []
  },
  "score": {
    "clarity": 0,
    "accuracy": 0,
    "precision": 0,
    "relevance": 0,
    "depth": 0,
    "breadth": 0,
    "logic": 0,
    "significance": 0,
    "fairness": 0
  },
  "strengths": [],
  "weaknesses": []
}

Trả về JSON ngay.
`;
}