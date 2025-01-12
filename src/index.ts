import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { spawn } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';
import * as FirebaseService from "./firebaseService";
import { Expo } from "expo-server-sdk";
import { CronJob } from "cron";
import { get, onChildChanged, onValue, ref, set } from 'firebase/database';

const expo = new Expo();

let tempSent = false;
let humdSent = false;
let soilSent = false;
let vocSent = false;

let hour = new Date().getHours();
let tempCount = 0;
let soilCount = 0;
let humidCount = 0;
let vocCount = 0;
let token = "";

async function listen () {
    token = await FirebaseService.getToken();

    onValue(ref(FirebaseService.db, 'temperature/value'), async (_) => {
        const data = (await get(ref(FirebaseService.db, 'temperature'))).val()  as { '24h': string, value: string };
        console.log(data);
        const splittedData = data['24h'].split(',');

        if(new Date().getHours() != hour) {
            hour = new Date().getHours();
            tempCount = 0;
            soilCount = 0;
            humidCount = 0;
            vocCount = 0;
        }
        
        splittedData[hour] = ((parseFloat(splittedData[hour]) * tempCount + parseFloat(data.value)) / (++tempCount)).toString();

        set(ref(FirebaseService.db, 'temperature/24h'), splittedData.join(','));

        if (parseFloat(data.value) > 25 || parseFloat(data.value) < 30) {
            if (!tempSent) {
                expo.sendPushNotificationsAsync([
                    {
                        to: token,
                        title: "WARNING!",
                        body: "Temprature is too high",
                    },
                ]);
                tempSent = true;
            }
            console.log("sending notification");
        } else {
            tempSent = false;
        }
    })

    onValue(ref(FirebaseService.db, 'humidity/value'), async (_) => {
        const data = (await get(ref(FirebaseService.db, 'humidity'))).val()  as { '24h': string, value: string };
        console.log(data);
        const splittedData = data['24h'].split(',');

        if(new Date().getHours() != hour) {
            hour = new Date().getHours();
            tempCount = 0;
            soilCount = 0;
            humidCount = 0;
            vocCount = 0;
        }
        
        splittedData[hour] = ((parseFloat(splittedData[hour]) * humidCount + parseFloat(data.value)) / (++humidCount)).toString();

        set(ref(FirebaseService.db, 'humidity/24h'), splittedData.join(','));

        if (parseFloat(data.value) < 40 || parseFloat(data.value) > 30) {
            if (!humdSent) {
                expo.sendPushNotificationsAsync([
                    {
                        to: token,
                        title: "WARNING!",
                        body: "Humidity is too high",
                    },
                ]);
                humdSent = true;
            }
        } else {
            humdSent = false;
        }
    })

    onValue(ref(FirebaseService.db, 'voc/value'), async (_) => {
        const data = (await get(ref(FirebaseService.db, 'voc'))).val()  as { '24h': string, value: string };
        console.log(data);
        const splittedData = data['24h'].split(',');

        if(new Date().getHours() != hour) {
            hour = new Date().getHours();
            tempCount = 0;
            soilCount = 0;
            humidCount = 0;
            vocCount = 0;
        }
        
        splittedData[hour] = ((parseFloat(splittedData[hour]) * vocCount + parseFloat(data.value)) / (++vocCount)).toString();

        set(ref(FirebaseService.db, 'voc/24h'), splittedData.join(','));

        if (parseFloat(data.value) > 0.6) {
            if (!vocSent) {
                expo.sendPushNotificationsAsync([
                    {
                        to: token,
                        title: "WARNING!",
                        body: "VOC is too high",
                    },
                ]);
                vocSent = true;
            }
        } else {
            vocSent = false;
        }
    })

    onValue(ref(FirebaseService.db, 'soilMoisture/value'), async (_) => {
        const data = (await get(ref(FirebaseService.db, 'voc'))).val()  as { '24h': string, value: string };
        console.log(data);
        const splittedData = data['24h'].split(',');

        if(new Date().getHours() != hour) {
            hour = new Date().getHours();
            tempCount = 0;
            soilCount = 0;
            humidCount = 0;
            vocCount = 0;
        }
        
        splittedData[hour] = ((parseFloat(splittedData[hour]) * soilCount + parseFloat(data.value)) / (++soilCount)).toString();

        set(ref(FirebaseService.db, 'soilMoisture/24h'), splittedData.join(','));

        if (parseFloat(data.value) > 20 || parseFloat(data.value) < 60) {
            if (!soilSent) {
                expo.sendPushNotificationsAsync([
                    {
                        to: token,
                        title: "WARNING!",
                        body: "Soil Moisture is too high",
                    },
                ]);
                soilSent = true;
            }
        } else {
            soilSent = false;
        }
    })
}

listen();

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
    // console.log(uploadPath);

    file.mv(uploadPath, async (err) => {
        if (err) {
            throw Error(err);
        }

        try {
            const python = spawn(process.env.PYTHON_NAME ?? "python", ['dist/script.py', uploadPath]);

            // Handle the output from the Python script
            python.stdout.on('data', (data) => {
                console.log(`Output from Python: ${data}`);
                // FirebaseService.setDisease(data.toString());
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


app.post("/registerPushToken", async (req: Request, res: Response) => {
    const token = String(req.body.token);
    await FirebaseService.saveToken(token);

    res.status(200).send("success");
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
