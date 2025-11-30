require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const logger = require("./lib/logger");
const routes = require("./routes");
const billingController = require("./controllers/billingController");

const app = express();

app.use(helmet());
app.use(compression());

// PATCH: CORS Dinâmico
let corsOriginOption = true;
if (process.env.CORS_ORIGINS) {
  const allowed = process.env.CORS_ORIGINS.split(',').map(s => s.trim());
  corsOriginOption = (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  };
}
app.use(cors({ origin: corsOriginOption }));

const limiter = rateLimit({ windowMs: 60000, max: 1200 });
app.use(limiter);

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    app.post('/billing/webhook', express.raw({ type: 'application/json' }), billingController.webhookHandler);
    logger.info("Stripe Webhook mounted.");
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const TMP_DIR = path.join(__dirname, 'tmp/audio');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

app.use("/", routes);

app.get('/ready', (req, res) => res.sendStatus(200));
app.get('/status', (req, res) => res.json({ status: "Kairós Online", version: "3.9.3" }));

app.use((err, req, res, next) => {
  logger.error({ err });
  res.status(err.status || 500).json({ error: "Internal Error" });
});

const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, "0.0.0.0", () => logger.info(`Server running on ${PORT}`));
const shutdown = () => { logger.info('Stopping...'); process.exit(0); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
