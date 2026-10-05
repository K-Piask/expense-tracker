require("dotenv").config();

const express = require("express");
const cors = require("cors");

const expensesRouter = require("./routes/expenses");
const categoriesRouter = require("./routes/categories");
const promotionsRouter = require("./routes/promotions");
const shoppingListsRouter = require("./routes/shoppingLists");
const authRouter = require("./routes/auth");
const webhooksRouter = require("./routes/webhooks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Backend działa" });
});

app.use("/api/expenses", expensesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/promotions", promotionsRouter);
app.use("/api/shopping-lists", shoppingListsRouter);
app.use("/api/auth", authRouter);
app.use("/api/webhooks", webhooksRouter);

/*const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API działa na http://localhost:${PORT}`);
});*/

if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`API działa lokalnie na http://localhost:${PORT}`);
    });
}

module.exports = app;