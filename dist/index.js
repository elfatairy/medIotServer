"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || "8080");
console.log(port);
app.use(body_parser_1.default.json());
app.disable("x-powered-by");
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.get('/', (req, res) => {
    res.json({ 'message': 'ok' });
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
