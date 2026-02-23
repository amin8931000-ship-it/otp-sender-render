const express = require("express");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const FAST2SMS_KEY = process.env.FAST2SMS_KEY;

/* =========================
   Rate Limit (1 min = 3 req)
========================= */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: "Too many OTP requests. Try later." }
});

app.use("/send-otp", limiter);

/* =========================
   Send OTP (Single only)
========================= */
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: FAST2SMS_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "v3",
        message: `Your OTP is ${otp}`,
        language: "english",
        flash: 0,
        numbers: phone
      })
    });

    console.log("OTP sent to", phone, ":", otp);

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

/* =========================
   Home Route
========================= */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
