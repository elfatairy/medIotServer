"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs = __importStar(require("fs"));
const FirebaseService = __importStar(require("./firebaseService"));
const expo_server_sdk_1 = require("expo-server-sdk");
const database_1 = require("firebase/database");
const expo = new expo_server_sdk_1.Expo();
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
function listen() {
    return __awaiter(this, void 0, void 0, function* () {
        token = yield FirebaseService.getToken();
        (0, database_1.onValue)((0, database_1.ref)(FirebaseService.db, 'temperature/value'), (_) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield (0, database_1.get)((0, database_1.ref)(FirebaseService.db, 'temperature'))).val();
            console.log(data);
            const splittedData = data['24h'].split(',');
            if (new Date().getHours() != hour) {
                hour = new Date().getHours();
                tempCount = 0;
                soilCount = 0;
                humidCount = 0;
                vocCount = 0;
            }
            splittedData[hour] = ((parseFloat(splittedData[hour]) * tempCount + parseFloat(data.value)) / (++tempCount)).toString();
            (0, database_1.set)((0, database_1.ref)(FirebaseService.db, 'temperature/24h'), splittedData.join(','));
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
            }
            else {
                tempSent = false;
            }
        }));
        (0, database_1.onValue)((0, database_1.ref)(FirebaseService.db, 'humidity/value'), (_) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield (0, database_1.get)((0, database_1.ref)(FirebaseService.db, 'humidity'))).val();
            console.log(data);
            const splittedData = data['24h'].split(',');
            if (new Date().getHours() != hour) {
                hour = new Date().getHours();
                tempCount = 0;
                soilCount = 0;
                humidCount = 0;
                vocCount = 0;
            }
            splittedData[hour] = ((parseFloat(splittedData[hour]) * humidCount + parseFloat(data.value)) / (++humidCount)).toString();
            (0, database_1.set)((0, database_1.ref)(FirebaseService.db, 'humidity/24h'), splittedData.join(','));
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
            }
            else {
                humdSent = false;
            }
        }));
        (0, database_1.onValue)((0, database_1.ref)(FirebaseService.db, 'voc/value'), (_) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield (0, database_1.get)((0, database_1.ref)(FirebaseService.db, 'voc'))).val();
            console.log(data);
            const splittedData = data['24h'].split(',');
            if (new Date().getHours() != hour) {
                hour = new Date().getHours();
                tempCount = 0;
                soilCount = 0;
                humidCount = 0;
                vocCount = 0;
            }
            splittedData[hour] = ((parseFloat(splittedData[hour]) * vocCount + parseFloat(data.value)) / (++vocCount)).toString();
            (0, database_1.set)((0, database_1.ref)(FirebaseService.db, 'voc/24h'), splittedData.join(','));
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
            }
            else {
                vocSent = false;
            }
        }));
        (0, database_1.onValue)((0, database_1.ref)(FirebaseService.db, 'soilMoisture/value'), (_) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield (0, database_1.get)((0, database_1.ref)(FirebaseService.db, 'voc'))).val();
            console.log(data);
            const splittedData = data['24h'].split(',');
            if (new Date().getHours() != hour) {
                hour = new Date().getHours();
                tempCount = 0;
                soilCount = 0;
                humidCount = 0;
                vocCount = 0;
            }
            splittedData[hour] = ((parseFloat(splittedData[hour]) * soilCount + parseFloat(data.value)) / (++soilCount)).toString();
            (0, database_1.set)((0, database_1.ref)(FirebaseService.db, 'soilMoisture/24h'), splittedData.join(','));
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
            }
            else {
                soilSent = false;
            }
        }));
    });
}
listen();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || "8080");
console.log(port);
app.use(body_parser_1.default.json());
app.use((0, express_fileupload_1.default)());
app.disable("x-powered-by");
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.get('/', (req, res) => {
    res.json({ 'message': 'ok' });
});
app.post('/upload-img', (req, res) => {
    if (!req.files || Object.keys(req.files).length != 1) {
        console.log("Error uploading image");
        res.send("error");
        return;
    }
    const file = Array.isArray(req.files['file']) ? req.files["file"][0] : req.files['file'];
    const fileName = `${new Date().getTime()}.${file.name.split('.')[1]}`;
    const uploadPath = (0, path_1.join)(__dirname, '../uploads', fileName);
    // console.log(uploadPath);
    file.mv(uploadPath, (err) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (err) {
            throw Error(err);
        }
        try {
            const python = (0, child_process_1.spawn)((_a = process.env.PYTHON_NAME) !== null && _a !== void 0 ? _a : "python", ['dist/script.py', uploadPath]);
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
        }
        catch (error) {
            throw Error('Error uploading to Bunny CDN: ' + error);
        }
    }));
    res.send("done");
});
app.post("/registerPushToken", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = String(req.body.token);
    yield FirebaseService.saveToken(token);
    res.status(200).send("success");
}));
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
