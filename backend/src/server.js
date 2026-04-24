require("dotenv").config();

const express = require("express");
const cors = require("cors");

const expensesRouter = require("./routes/expenses");
const categoriesRouter = require("./routes/categories");
const promotionsRouter = require("./routes/promotions");
const shoppingListRouter = require("./routes/shoppingLists")
const authRouter = require("./routes/auth")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Backend działa" });
});

app.use("/api/expenses", expensesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/promotions", promotionsRouter);
app.use("/api/shopping-lists", shoppingListRouter);
app.use("/api/auth", authRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API działa na http://localhost:${PORT}`);
});