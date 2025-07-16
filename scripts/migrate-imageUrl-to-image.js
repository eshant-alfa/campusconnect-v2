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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var adminClient_1 = require("../sanity/lib/adminClient");
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var os_1 = __importDefault(require("os"));
function downloadImage(url, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var res, arrayBuffer, buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url)];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("Failed to download image: ".concat(url));
                    return [4 /*yield*/, res.arrayBuffer()];
                case 2:
                    arrayBuffer = _a.sent();
                    buffer = Buffer.from(arrayBuffer);
                    return [4 /*yield*/, promises_1.default.writeFile(dest, buffer)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, dest];
            }
        });
    });
}
function uploadImageToSanity(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var file, asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promises_1.default.readFile(filePath)];
                case 1:
                    file = _a.sent();
                    return [4 /*yield*/, adminClient_1.adminClient.assets.upload('image', file, {
                            filename: path_1.default.basename(filePath),
                        })];
                case 2:
                    asset = _a.sent();
                    return [2 /*return*/, {
                            _type: 'image',
                            asset: { _type: 'reference', _ref: asset._id },
                        }];
            }
        });
    });
}
function migrateDocuments(type) {
    return __awaiter(this, void 0, void 0, function () {
        var docs, _i, docs_1, doc, _id, imageUrl, ext, tmpFile, imageField, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, adminClient_1.adminClient.fetch("*[_type == $type && defined(imageUrl)]{_id, imageUrl}", { type: type })];
                case 1:
                    docs = _a.sent();
                    console.log("Found ".concat(docs.length, " ").concat(type, " documents with imageUrl"));
                    _i = 0, docs_1 = docs;
                    _a.label = 2;
                case 2:
                    if (!(_i < docs_1.length)) return [3 /*break*/, 10];
                    doc = docs_1[_i];
                    _id = doc._id, imageUrl = doc.imageUrl;
                    if (!imageUrl || typeof imageUrl !== 'string') {
                        console.warn("Skipping ".concat(type, " ").concat(_id, ": invalid imageUrl"));
                        return [3 /*break*/, 9];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 8, , 9]);
                    ext = imageUrl.includes('base64') ? '.jpg' : path_1.default.extname(imageUrl) || '.jpg';
                    tmpFile = path_1.default.join(os_1.default.tmpdir(), "".concat(_id).concat(ext));
                    return [4 /*yield*/, downloadImage(imageUrl, tmpFile)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, uploadImageToSanity(tmpFile)];
                case 5:
                    imageField = _a.sent();
                    return [4 /*yield*/, adminClient_1.adminClient.patch(_id).set({ image: imageField }).unset(['imageUrl']).commit()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, promises_1.default.unlink(tmpFile)];
                case 7:
                    _a.sent();
                    console.log("Migrated ".concat(type, " ").concat(_id));
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _a.sent();
                    console.error("Failed to migrate ".concat(type, " ").concat(_id, ":"), err_1);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10: return [2 /*return*/];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, migrateDocuments('user')];
            case 1:
                _a.sent();
                return [4 /*yield*/, migrateDocuments('event')];
            case 2:
                _a.sent();
                console.log('Migration complete.');
                return [2 /*return*/];
        }
    });
}); })();
