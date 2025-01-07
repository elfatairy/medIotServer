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
    console.log(uploadPath);
    file.mv(uploadPath, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            throw Error(err);
        }
        try {
            const python = (0, child_process_1.spawn)('python', ['dist/script.py', uploadPath]);
            // Handle the output from the Python script
            python.stdout.on('data', (data) => {
                console.log(`Output from Python: ${data}`);
                fs.unlinkSync(uploadPath);
            });
            // Handle any errors from the Python script
            python.stderr.on('data', (data) => {
                console.error(`Error from Python: ${data}`);
                // fs.unlinkSync(uploadPath);
            });
        }
        catch (error) {
            throw Error('Error uploading to Bunny CDN: ' + error);
        }
    }));
    res.send("done");
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
