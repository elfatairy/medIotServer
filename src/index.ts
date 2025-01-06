import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
const app = express();
const port = parseInt(process.env.PORT || "3002");
console.log(port);

app.use(bodyParser.json());
app.disable("x-powered-by");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/', (req: Request, res: Response) => {
    res.json({ 'message': 'ok' });
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
