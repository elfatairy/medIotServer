"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDisease = exports.getAirQuality = exports.getEmergency = exports.getHumidity = exports.getTemprature = exports.getToken = exports.saveToken = exports.db = exports._ = void 0;
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
const firebaseConfig = {
    apiKey: "",
    authDomain: "esp32-16690.firebaseapp.com",
    databaseURL: "https://esp32-16690-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "esp32-16690",
    storageBucket: "esp32-16690.appspot.com",
    messagingSenderId: "270762185717",
    appId: "1:270762185717:web:7712bb5b437b935fab46bc",
    measurementId: "G-P76M6SCGSH",
};
exports._ = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, database_1.getDatabase)();
const dbRef = (0, database_1.ref)(exports.db);
const saveToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const values = (_a = (yield (0, database_1.get)((0, database_1.child)(dbRef, "userTokens"))).val()) !== null && _a !== void 0 ? _a : {};
    const payload = Object.assign(Object.assign({}, values), { token });
    (0, database_1.set)((0, database_1.ref)(exports.db, "userTokens"), payload);
});
exports.saveToken = saveToken;
const getToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const values = (yield (0, database_1.get)((0, database_1.child)(dbRef, "userTokens/token"))).val();
    return values !== null && values !== void 0 ? values : {};
});
exports.getToken = getToken;
const getTemprature = () => __awaiter(void 0, void 0, void 0, function* () {
    const value = (yield (0, database_1.get)((0, database_1.child)(dbRef, "temperature/value"))).val();
    return value;
});
exports.getTemprature = getTemprature;
const getHumidity = () => __awaiter(void 0, void 0, void 0, function* () {
    const value = (yield (0, database_1.get)((0, database_1.child)(dbRef, "humidity/value"))).val();
    return value;
});
exports.getHumidity = getHumidity;
const getEmergency = () => __awaiter(void 0, void 0, void 0, function* () {
    const value = (yield (0, database_1.get)((0, database_1.child)(dbRef, "emergency/value"))).val();
    return value;
});
exports.getEmergency = getEmergency;
const getAirQuality = () => __awaiter(void 0, void 0, void 0, function* () {
    const value = (yield (0, database_1.get)((0, database_1.child)(dbRef, "airquality/value"))).val();
    return value;
});
exports.getAirQuality = getAirQuality;
const setDisease = (value) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.set)((0, database_1.child)(dbRef, "disease/value"), value);
});
exports.setDisease = setDisease;
