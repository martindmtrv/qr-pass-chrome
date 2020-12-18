import cuid from 'cuid';
import express, { Response } from 'express';
import cors from "cors";

const app = express();
const port = 5000;

const waiting: Record<string, Response> = {};

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.url, req.method, req.body);
    next();
})


// this endpoint will give the cuid for the QR code to generate
app.post("/password", (req, res) => {
    const id = cuid();
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
        console.log(`removing ${req.params.id}`)
        waiting[req.params.id] = undefined;
        res.status(404).send();
    }, 120000);
});

// the phone will send POST with the password to this endpoint
app.post("/password/:id", (req, res) => {
    if (!waiting[req.params.id]) {
        res.status(404).send();
    } else {
        const loginTo = waiting[req.params.id];
        loginTo.status(200).json({ pw: req.body.pw });
        res.status(200).send();
    }
});


app.listen(port, () => console.log(`Running on port ${port}`));