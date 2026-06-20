const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Mini CRM API is running...");
});

// MongoDB connection (local Compass)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import Lead model
const Lead = require("./models/Lead");

// 🔐 JWT Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}



// 🔐 Admin login route
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Received:", email, password); // Debug line

  if (email === "admin@example.com" && password === "1234") {
    const token = jwt.sign({ role: "admin" }, "secretkey", { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});



// Public route: Contact form submissions (no token required)
app.post("/api/leads", async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin route: Protected lead creation
app.post("/api/admin/leads", verifyToken, async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




// 📥 Get all leads (protected)
app.get("/api/leads", verifyToken, async (req, res) => {
  try {
    const leads = await Lead.find();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update lead status (protected)
app.put("/api/leads/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📝 Add note to lead (protected)
app.put("/api/leads/:id/notes", verifyToken, async (req, res) => {
  try {
    const { note } = req.body;
    const lead = await Lead.findById(req.params.id);
    lead.notes.push(note);
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete a lead (protected)
app.delete("/api/leads/:id", verifyToken, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Analytics route (protected)
app.get("/api/leads/analytics", verifyToken, async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const contacted = await Lead.countDocuments({ status: "contacted" });
    const converted = await Lead.countDocuments({ status: "converted" });
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

    res.json({ total, contacted, converted, conversionRate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Server listen
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
