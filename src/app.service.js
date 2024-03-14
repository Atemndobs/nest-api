"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
exports.AppService = void 0;
var common_1 = require("@nestjs/common");
var start_1 = require("./start");
var fs = require("fs");
var python_shell_1 = require("python-shell");
var axios_1 = require("axios");
var AppService = /** @class */ (function () {
    function AppService() {
    }
    AppService.prototype.getHello = function () {
        return 'Hello Danm!';
    };
    AppService.prototype.healthCheck = function () {
        Object.keys(require.cache).forEach(function (key) { delete require.cache[key]; });
        return { status: 'Working !!' };
    };
    AppService.prototype.getClassifier = function (track) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSongByTitle(track).then(function (res) {
                            var id = res.id;
                            var path = res.path;
                            var url = path;
                            if (!_this.checkFileType(track)) {
                                try {
                                    var newUrl = _this.convertAudio(track, path);
                                    var self_1 = _this;
                                    newUrl.on('message', function (message) {
                                        if (message.toString().includes('wav')) {
                                            var checked_path = message;
                                            if (fs.existsSync(checked_path)) {
                                                var pred = (0, start_1.analyzeMp3)(checked_path, id);
                                                var originalFile = "./src/audio/".concat(track);
                                                console.log('AFTRER CONVERT');
                                                self_1.deleteMp3(originalFile);
                                                return pred;
                                            }
                                            else {
                                                return 'PROCESS FAILED';
                                            }
                                        }
                                    });
                                    newUrl.end(function (err, code, signal) {
                                        console.log({ err: err });
                                        console.log('The exit code was: ' + code);
                                        console.log('The exit signal was: ' + signal);
                                        console.log('finished');
                                    });
                                }
                                catch (e) {
                                    return { error: e.message };
                                }
                            }
                            else {
                                try {
                                    (0, start_1.processImportAudio)(url, id);
                                }
                                catch (e) {
                                    return { error: e.message };
                                }
                            }
                            return res;
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AppService.prototype.getSongByTitle = function (track) {
        var config = {
            method: 'get',
            url: "http://127.0.0.1:8899/api/classify/song/?title=".concat(track),
            headers: {}
        };
        // @ts-ignore
        return (0, axios_1["default"])(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
            if (response.status != 200) {
                return {
                    error: response.data
                };
            }
            return response.data;
        })["catch"](function (error) {
            console.log(error.message);
            return { error: error.message };
        });
    };
    AppService.prototype.convertAudio = function (mp3File, path) {
        var mp3 = mp3File.slice(0, -4);
        var options = {
            args: ["--song", "".concat(path), "--name", "".concat(mp3File)]
        };
        var wav;
        var self = this;
        return python_shell_1.PythonShell.run('./src/convert.py', options, function (err, res) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("succefully converted ".concat(mp3File, " to ").concat(mp3, ".wav"));
                var wavFile = "".concat(mp3, ".wav");
                wav = "./src/audio/".concat(mp3, ".wav");
                var originalFile = "./src/audio/".concat(mp3File);
                console.log('AFTRER CONVERT');
                self.deleteMp3(originalFile);
                console.log({ wav: wav });
            }
            return wav;
        });
    };
    AppService.prototype.deleteMp3 = function (file) {
        var rmFile = fs.unlink(file, function (err) {
            if (err)
                throw err;
        });
        return rmFile;
    };
    AppService.prototype.checkFileType = function (traclUrl) {
        var lastThree = traclUrl.substr(traclUrl.length - 3);
        if (lastThree !== 'wav') {
            var msg = {
                Error: 'Wrong file format',
                message: 'Only .wav files can be analyzed'
            };
            console.log(msg);
            return false;
        }
        return true;
    };
    AppService.prototype.clearAudioDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var directory, rmDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        directory = './src/audio/';
                        return [4 /*yield*/, fs.readdir(directory, function (err, files) {
                                if (err)
                                    throw err;
                                for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                                    var file = files_1[_i];
                                    var file_path = './src/audio/' + file;
                                    fs.unlink(file_path, function (err) {
                                        if (err)
                                            throw err;
                                    });
                                }
                            })];
                    case 1:
                        rmDir = _a.sent();
                        return [2 /*return*/, rmDir];
                }
            });
        });
    };
    AppService = __decorate([
        (0, common_1.Injectable)()
    ], AppService);
    return AppService;
}());
exports.AppService = AppService;
function dd(msg) {
    if (msg === void 0) { msg = null; }
    console.info({
        msg: msg,
        location: 'You are Here now'
    });
    console.log('*+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    return process.exit(0);
}
