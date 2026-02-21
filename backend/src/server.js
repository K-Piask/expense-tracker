require("dotenv").config();

const express = require("express");
const cors = require("cors");

const expensesRouter = require("./routes/expenses");
const categoriesRouter = require("./routes/categories");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Backend działa" });
});

app.use("/expenses", expensesRouter);
app.use("/categories", categoriesRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API działa na http://localhost:${PORT}`);
});