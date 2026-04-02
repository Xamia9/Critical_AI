import mongoose from "mongoose";

const debateSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true
  },

  title: {
    type: String,
    default: "Untitled Debate"
  },
  
  summary: {
  type: String,
  default: ""
},

  status: {
    type: String,
    enum: ["in_progress", "completed"],
    default: "in_progress"
  },

  issue: String,
  viewpoint: String,

  roles: {
    role1: Object,
    role2: Object,
    role3: Object
  },

  mindmaps: {
    role1: Object,
    role2: Object,
    role3: Object
  },

  roleAttempts: {
    role1: { type: Number, default: 0 },
    role2: { type: Number, default: 0 },
    role3: { type: Number, default: 0 }
  },

  roleStatus: {
    role1: { type: String, default: "in_progress" },
    role2: { type: String, default: "in_progress" },
    role3: { type: String, default: "in_progress" }
  },

decision: {
  type: mongoose.Schema.Types.Mixed,
  default: null
},

  scores: {
  score: {
    clarity: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    precision: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
    breadth: { type: Number, default: 0 },
    logic: { type: Number, default: 0 },
    significance: { type: Number, default: 0 },
    fairness: { type: Number, default: 0 }
  },
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 }
},

consequences: {
  shortTerm: { type: [String], default: [] },
  longTerm: { type: [String], default: [] },
  risks: { type: [String], default: [] },
  conflicts: { type: [String], default: [] }
},

strengths: {
  type: [String],
  default: []
},

weaknesses: {
  type: [String],
  default: []
},

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Debate", debateSchema);