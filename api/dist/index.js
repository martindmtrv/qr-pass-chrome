"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cuid_1 = __importDefault(require("cuid"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
const port = 5000;
const waiting = {};
app.use(cors_1.default());
app.use(express_1.default.json());
// app.use((req, res, next) => {
//     console.log(req.url, req.method);
//     next();
// })
// this endpoint will give the cuid for the QR code to generate
app.post("/password", (req, res) => {
    const id = cuid_1.default();
    waiting[id] = null;
    console.log(id);
    res.status(200).send(id);
});
// after creating the QR code request this endpoint and hang until 2 mins or the password POST is received
app.get("/password/:id", (req, res) => {
    if (waiting[req.params.id] !== null) {
        res.status(404).send();
        return;
    }
    waiting[req.params.id] = res;
    // wait 2 mins before removing the request (need to restart the process)
    setTimeout(() => {
        console.log(`removing ${req.params.id}`);
        waiting[req.params.id] = undefined;
        res.status(404).send();
    }, 120000);
});
// the phone will send POST with the password to this endpoint
app.post("/password/:id", (req, res) => {
    if (!waiting[req.params.id]) {
        res.status(404).send();
    }
    else {
        const loginTo = waiting[req.params.id];
        loginTo.status(200).json({ pw: req.body.pw });
        res.status(200).send();
    }
});
app.listen(port, () => console.log(`Running on port ${port}`));
//# sourceMappingURL=index.js.map