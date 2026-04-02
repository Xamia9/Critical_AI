import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { runSimulation } from "./engine/simulationEngine.js";
import { generateOverview } from "./engine/overviewEngine.js";

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

  
import Debate from "./models/Debate.js";
import authMiddleware from "./middleware/authMiddleware.js";


const JWT_SECRET = process.env.JWT_SECRET;


const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug: Log paths in production
if (process.env.NODE_ENV === 'production') {
  console.log("Production mode - Static paths:");
  console.log("__dirname:", __dirname);
  console.log("Frontend path:", join(__dirname, "..", "Frontend"));
}

// Serve static files from Frontend folder (absolute path)
const frontendPath = join(__dirname, "..", "Frontend");
app.use(express.static(frontendPath));

// Also serve root level static files
app.use(express.static(join(__dirname, "..")));

// Serve Introduction.html at root
app.get("/", (req, res) => {
  const filePath = join(frontendPath, "Introduction.html");
  console.log("Serving Introduction.html from:", filePath);
  res.sendFile(filePath);
});

// Catch-all route to serve HTML files from Frontend
app.use((req, res, next) => {
  if (req.path.endsWith(".html")) {
    const fileName = req.path.slice(1); // Remove leading /
    const filePath = join(frontendPath, fileName);
    console.log("Serving HTML file:", filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.log("File not found:", filePath);
        next();
      }
    });
  } else {
    next();
  }
});

import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);

// ===== MULTI API KEY SYSTEM =====




const apiKeys = [
  process.env.GEMINI_KEY_1,
  process.env.GEMINI_KEY_2,
  process.env.GEMINI_KEY_3,
  process.env.GEMINI_KEY_4,
  process.env.GEMINI_KEY_5,
  process.env.GEMINI_KEY_6
].filter(Boolean);

console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Loaded API keys count:", apiKeys.length);
console.log("Keys present:", apiKeys.map((k, i) => `Key ${i+1}: ${k ? 'YES' : 'NO'}`).join(', '));

let currentKeyIndex = 0;

function getModel() {
  const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });
}

async function generateWithRotation(prompt, forceJson = false) {
  for (let i = 0; i < apiKeys.length; i++) {

    const keyIndex = (currentKeyIndex + i) % apiKeys.length;
    const genAI = new GoogleGenerativeAI(apiKeys[keyIndex]);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: forceJson
          ? { responseMimeType: "application/json" }
          : undefined
      });

      currentKeyIndex = keyIndex; // cập nhật key đang hoạt động
      return result.response.candidates[0].content.parts[0].text;

    } catch (error) {

      console.log("❌ Key lỗi:", keyIndex, error.message);

      if (
        error.message.includes("429") ||
        error.message.toLowerCase().includes("quota")
      ) {
        continue; // thử key tiếp theo
      }

      // Lỗi mạng / fetch failed → vẫn thử key tiếp theo
      continue;
    }
  }

  throw new Error("All API keys failed");
}

app.post("/summarize", authMiddleware, async (req, res) => {
  console.log("REQ BODY:", req.body);
  try {
    const userInput = req.body;

const combinedInput = `
PHẦN ISSUE
Loại vấn đề: ${userInput.loaiVanDe}
Tình huống cốt lõi: ${userInput.vanDeChinh}
Mức độ liên hệ: ${userInput.mucDoLienHe}
Ai bị ảnh hưởng: ${Array.isArray(userInput.doiTuongTacDong) 
  ? userInput.doiTuongTacDong.join(", ") 
  : userInput.doiTuongTacDong}
Hậu quả tệ nhất có thể xảy ra: ${userInput.hauQuaSai}

PHẦN VIEWPOINT
Trạng thái hiện tại: ${userInput.trangThai}
Mức độ chắc chắn: ${userInput.mucTuTin}%
`;
const prompt = `
- Vai trò:
  - Bạn là hệ thống chuẩn hóa dữ liệu cho nền tảng rèn luyện tư duy phản biện.

- Mục tiêu:
  - Chuyển dữ liệu người dùng thành cấu trúc "tình huống quyết định" rõ ràng.
  - Không phân tích, không đánh giá, không thêm ý mới.
  - Chỉ giữ lại yếu tố quan trọng để tạo vai trò phản biện.

- Nhiệm vụ:

1) PHẦN ISSUE:
   - Viết 3–5 bullet ngắn:
     - Tình huống cốt lõi
     - Lựa chọn hoặc điều đang phân vân
     - Ai bị ảnh hưởng
     - Rủi ro hoặc hậu quả tệ nhất có thể xảy ra

2) PHẦN VIEWPOINT:
   - Viết 3–4 bullet ngắn:
     - Quan điểm hiện tại
     - Lý do chính
     - Mức độ chắc chắn (giữ nguyên % nếu có)
     - Mức cam kết (làm / không làm / chưa biết)

- Quy tắc:
  - Xưng "bạn"
  - Không viết mở đầu
  - Không giải thích thêm
  - Mỗi bullet tối đa 1 dòng
  - Chỉ dùng "- "
  - Trả về đúng JSON
  - Không thêm bất kỳ chữ nào ngoài JSON

- Cấu trúc trả về:

{
  "issue": "chuỗi bullet của PHẦN ISSUE",
  "viewpoint": "chuỗi bullet của PHẦN VIEWPOINT"
}

- Dữ liệu người dùng:
${combinedInput}
`;
let raw = await generateWithRotation(prompt, true);
    raw = raw.replace(/```json/g, "")
             .replace(/```/g, "")
             .trim();

    const parsed = JSON.parse(raw);

// 🔥 GỌI AI TẠO TITLE + SUMMARY
const overview = await generateOverview(
  generateWithRotation,
  parsed.issue
);

const newDebate = await Debate.create({
  userId: req.userId,

  title: overview.title,          // 🔥 AI đặt
  summary: overview.summary,      // 🔥 AI tóm tắt
  status: "in_progress",

  issue: parsed.issue,
  viewpoint: parsed.viewpoint,

      roles: {
        role1: null,
        role2: null,
        role3: null
      },

mindmaps: {
  role1: { name: "", text: "", children: [] },
  role2: { name: "", text: "", children: [] },
  role3: { name: "", text: "", children: [] }
},
      decision: null,
      scores: null
    });

    res.json({
      success: true,
      debateId: newDebate._id
    });

  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ error: "AI processing error" });
  }
});

// ===== ROUTE CHO OVERVIEW =====
app.post("/get-overview", authMiddleware, async (req, res) => {
  const { debateId } = req.body;
  const debate = await Debate.findById(debateId);

  if (!debate) {
    return res.status(404).json({ error: "Debate không tồn tại" });
  }

  res.json({
    issue: debate.issue,
    viewpoint: debate.viewpoint
  });
});



///tạo 3 vai trò///
app.post("/generate-roles", authMiddleware, async (req, res) => {
  try {
    const { debateId } = req.body;

    const debate = await Debate.findById(debateId);

    if (!debate) {
      return res.status(404).json({ error: "Debate không tồn tại" });
    }

const prompt = `
    - Vai trò:
      - Bạn là chuyên gia thiết kế kịch bản luyện tư duy đa chiều (Critical Thinking & Problem Solving).

    - Nhiệm vụ:
      - Dựa trên bối cảnh và quan điểm bên dưới, hãy thiết kế 3 vai trò đại diện cho 3 GÓC NHÌN TƯ DUY khác nhau.
      - Tên vai trò phải dễ hiểu, ngắn gọn, phổ biến, phản ánh rõ góc nhìn và nhiệm vụ của họ.
      - Vai trò phải được đặt tên thực tế, có thể liên tưởng ngay đến vấn đề.
      - Mục tiêu: Giúp người dùng nhìn vấn đề toàn diện, không chỉ đơn thuần là thắng thua.
      - Mỗi vai trò sẽ có một góc nhìn đặc trưng: Thực tế, Thực thi & Tiềm năng, Rủi ro.
      - Phải trình bày ngắn gọn, súc tích nhưng vẫn làm rõ sự khác biệt về góc nhìn và nhiệm vụ của từng vai.

      - Định nghĩa 3 vai trò cụ thể:
        1. Role 1 (Góc độ Thực tế - The Realist): Người quan tâm đến dữ kiện, nguồn lực hiện có, tính khả thi và điều kiện thực tế (Focus on: "Có khả thi không?").
        2. Role 2 (Góc độ Thực thi & Tiềm năng - The Strategist): Người quan tâm đến cách triển khai, cơ hội phát triển, giá trị dài hạn và lợi ích nếu thực hiện tốt (Focus on: "Nếu làm tốt, sẽ đạt được gì?").
        3. Role 3 (Góc độ Rủi ro - The Risk Examiner): Người chuyên phân tích hệ quả tiêu cực, lỗ hổng, chi phí ẩn và tác dụng phụ (Focus on: "Điều gì có thể sai?").

      - Mỗi vai phải có đầy đủ thông tin sau:
        - ten: (Chức danh cụ thể phù hợp với góc nhìn và bố cảnh. Vd: "Quản lý vận hành","Kỹ sư vận hành", "Nhà khởi nghiệp", "Bộ giáo dục"...).
        - lapTruong: (Ghi chính xác là: "Thực tế", "Thực thi & Tiềm năng", hoặc "Rủi ro").
        - hoanCanh: (Mô tả ngắn gọn áp lực, chuyên môn hoặc lợi ích khiến họ có góc nhìn này).
        - nhiemVu: (Ghi ngắn gọn luận điểm cần chứng minh nhưng rõ ý)

    - Yêu cầu định dạng:
      - Không viết mở đầu.
      - Không giải thích thêm.
      - Trình bày ngắn gọn, súc tích nhất có thể.
      - Trả về đúng JSON chuẩn.

    {
      "role1": { "ten": "", "lapTruong": "Thực tế", "hoanCanh": "", "nhiemVu": "" },
      "role2": { "ten": "", "lapTruong": "Thực thi & Tiềm năng", "hoanCanh": "", "nhiemVu": "" },
      "role3": { "ten": "", "lapTruong": "Rủi ro", "hoanCanh": "", "nhiemVu": "" }
    }

- Bối cảnh vấn đề:
${debate.issue}

- Quan điểm người dùng đang có:
${debate.viewpoint}
    `;

const text = await generateWithRotation(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI không trả JSON hợp lệ");
    }

    const rolesData = JSON.parse(jsonMatch[0]);

    await Debate.findByIdAndUpdate(debateId, {
      roles: rolesData,
      roleAttempts: {
        role1: 0,
        role2: 0,
        role3: 0
      },
      roleStatus: {
        role1: "in_progress",
        role2: "in_progress",
        role3: "in_progress"
      }
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Role generation error" });
  }
});

app.post("/get-roles", authMiddleware, async (req, res) => {
  const { debateId } = req.body;

  const debate = await Debate.findById(debateId);

  if (!debate) {
    return res.status(404).json({ error: "Debate không tồn tại" });
  }

  res.json(debate.roles);
});

import { getMindmapRolePrompt } from "./prompts/mindmapRoles.js";

app.post("/mindmap-debate", authMiddleware, async (req, res) => {
  try {

const { debateId, role, task, tree } = req.body;
const debate = await Debate.findById(debateId);

if (!debate) {
  return res.status(404).json({ error: "Debate không tồn tại" });
}


    if (!["role1","role2","role3"].includes(role)) {
      return res.status(400).json({ error: "Role không hợp lệ" });
    }

    // Nếu role đã hoàn thành → chặn
    if (debate.roleStatus[role] === "completed") {
      return res.json({
        error: "Vai trò này đã hoàn thành."
      });
    }


    if (debate.roleAttempts[role] === undefined) {
      debate.roleAttempts[role] = 0;
    }

    // Nếu đã đủ 3 lượt → bắt buộc hoàn thành
if (debate.roleAttempts[role] >= 3) {
  debate.roleStatus[role] = "completed";
  return res.json({
    forceComplete: true,
    attempts: debate.roleAttempts[role]
  });
}


    debate.roleAttempts[role] += 1;

// LƯU MINDMAP ĐÚNG CẤU TRÚC
// LẤY TÊN ROLE TỪ debate.roles
const roleName = debate.roles?.[role]?.ten || role;

debate.mindmaps[role] = {
  name: roleName,   // 🔥 THÊM DÒNG NÀY
  text: task,
  children: tree
};

await Debate.findByIdAndUpdate(debateId, {
  mindmaps: debate.mindmaps,
  roleAttempts: debate.roleAttempts,
  roleStatus: debate.roleStatus
});

const roleMap = {
  role1: "realist",
  role2: "visionary",
  role3: "skeptic"
};

const mappedRole = roleMap[role];

const mindmapText = JSON.stringify(tree, null, 2);

const prompt = getMindmapRolePrompt(
  mappedRole,        // ✅ dùng mappedRole
  task,
  mindmapText,
  debate.roleAttempts[role]
);


let text = await generateWithRotation(prompt);

    text = text.replace(/```json/g,"").replace(/```/g,"").trim();

   res.json({
  feedback: text,
  attemptsUsed: debate.roleAttempts[role]

});


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mindmap analyze failed" });
  }
});


app.post("/submit-decision", authMiddleware, async (req, res) => {
  const { debateId, decision } = req.body;

  const debate = await Debate.findById(debateId);

  if (!debate) {
    return res.status(404).json({ error: "Debate không tồn tại" });
  }

  await Debate.findByIdAndUpdate(debateId, {
    decision: decision
  });

  res.json({ success: true });
});

app.post("/get-decision", authMiddleware, async (req, res) => {
  const { debateId } = req.body;
  const debate = await Debate.findById(debateId);

  if (!debate) {
    return res.status(404).json({ error: "Debate không tồn tại" });
  }

  res.json({
    hasDecision: !!debate.decision,
    decision: debate.decision
  });
});


app.post("/run-simulation", authMiddleware, async (req, res) => {
  try {
    const { debateId } = req.body;
    const debate = await Debate.findById(debateId);

    if (!debate) {
      return res.status(404).json({ error: "Debate không tồn tại" });
    }

const result = await runSimulation(
  generateWithRotation,
  debate.decision,
  debate.mindmaps
);

await Debate.findByIdAndUpdate(debateId, {
  scores: {
    score: result.score,
    totalScore: result.totalScore,
    averageScore: result.averageScore
  },
  consequences: result.consequences,
  strengths: result.strengths,
  weaknesses: result.weaknesses
});

// SAU ĐÓ MỚI TRẢ RESPONSE
res.json({
  scores: {
    score: result.score,
    totalScore: result.totalScore,
    averageScore: result.averageScore
  },
  consequences: result.consequences,
  strengths: result.strengths,
  weaknesses: result.weaknesses,
  title: debate.title,
  mindmaps: debate.mindmaps,
  decision: debate.decision
});

  } catch (error) {
    console.error("Simulation error:", error);
    res.status(500).json({ error: "Simulation failed" });
  }
});


app.get("/api/history", authMiddleware, async (req, res) => {
  const debates = await Debate.find({ userId: req.userId })
    .sort({ createdAt: -1 });

  res.json(debates);
});


app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

app.post("/debate-status", authMiddleware, async (req, res) => {
  try {
    const { debateId } = req.body;
    const debate = await Debate.findById(debateId);

    if (!debate) {
      return res.json({
        hasRoles: false,
        allCompleted: false,
        hasDecision: false,
        hasScores: false
      });
    }

    const status = debate.roleStatus || {};

    const allCompleted =
      status.role1 === "completed" &&
      status.role2 === "completed" &&
      status.role3 === "completed";

    console.log("RoleStatus:", status);
    console.log("AllCompleted:", allCompleted);

    res.json({
      hasRoles: !!debate.roles,
      allCompleted,
      hasDecision: !!debate.decision,
      hasScores: !!debate.scores
    });

  } catch (err) {
    console.error(err);
    res.json({
      hasRoles: false,
      allCompleted: false,
      hasDecision: false,
      hasScores: false
    });
  }
});

app.post("/complete-role", authMiddleware, async (req, res) => {
  try {
    const { debateId, role } = req.body;

    if (!["role1", "role2", "role3"].includes(role)) {
      return res.status(400).json({ error: "Role không hợp lệ" });
    }

    const debate = await Debate.findById(debateId);

    if (!debate) {
      return res.status(404).json({ error: "Debate không tồn tại" });
    }

    debate.roleStatus[role] = "completed";

    await debate.save();

    const status = debate.roleStatus;

    const allCompleted =
      status.role1 === "completed" &&
      status.role2 === "completed" &&
      status.role3 === "completed";

    res.json({
      success: true,
      roleStatus: status,
      allCompleted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Complete role failed" });
  }
});

app.delete("/api/history/:id", authMiddleware, async (req, res) => {
  try {
    await Debate.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId   // 🔥 QUAN TRỌNG: chỉ xoá của user đó
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});

