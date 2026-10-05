const webhookAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.INTEGRATION_API_KEY) {
        return res.status(401).json({ error: 'Brak dostępu. Nieprawidłowy klucz API.' });
    }

    next();
};

module.exports = webhookAuth;