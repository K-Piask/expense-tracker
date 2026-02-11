const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Backend działa 🚀" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API działa na http://localhost:${PORT}`);
});