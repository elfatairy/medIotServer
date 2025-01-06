import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { spawn } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

const app = express();
const port = parseInt(process.env.PORT || "8080");
console.log(port);

app.use(bodyParser.json());
app.use(fileUpload());
app.disable("x-powered-by");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/', (req: Request, res: Response) => {
    res.json({ 'message': 'ok' });
})

app.post('/upload-img', (req: Request, res: Response) => {
    if (!req.files || Object.keys(req.files).length != 1) {
        console.log("Error uploading image");
        res.send("error");
        return;
    }
    const file = Array.isArray(req.files['file']) ? req.files["file"][0] : req.files['file'];
    const fileName = `${new Date().getTime()}.${file.name.split('.')[1]}`;
    const uploadPath = join(__dirname, '../uploads', fileName)
    console.log(uploadPath);

    file.mv(uploadPath, async (err) => {
        if (err) {
            throw Error(err);
        }

        try {
            const python = spawn('python', ['dist/script.py', uploadPath]);

            // Handle the output from the Python script
            python.stdout.on('data', (data) => {
                console.log(`Output from Python: ${data}`);
                fs.unlinkSync(uploadPath);
            });

            // Handle any errors from the Python script
            python.stderr.on('data', (data) => {
                console.error(`Error from Python: ${data}`);
                fs.unlinkSync(uploadPath);
            });

        } catch (error) {
            throw Error('Error uploading to Bunny CDN: ' + error);
        }
    });

    res.send("done");
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
