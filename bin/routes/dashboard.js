"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var _this = this;
exports.__esModule = true;
var express_1 = require("express");
var Cron = require("cron-converter");
var momentTz = require("moment-timezone");
var Logger_1 = require("../utils/Logger");
var router = express_1.Router();
router.get('/', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var logger, guild_id, guildDB, table, guildRes, peopleRes, channelRes, rolesRes, bot, e_1, zones, _i, _a, el, zoneEl, offset, zoneName, name_1, peopleData, rolesData, channelData;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                logger = new Logger_1["default"]("Dashboard");
                guild_id = req.query.id.toString();
                return [4 /*yield*/, req.dbManager.Guild.findOne({ where: { id: guild_id } })];
            case 1:
                guildDB = (_b.sent()).get();
                table = [];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, req.dbManager.Message.findAll({ where: { guild_id: req.query.id } })];
            case 3:
                table = (_b.sent());
                bot = req.app.get("bot");
                guildRes = bot.getGuild(guild_id);
                peopleRes = bot.getPeople(guild_id);
                channelRes = bot.getChannels(guild_id);
                rolesRes = bot.getRoles(guild_id);
                return [3 /*break*/, 5];
            case 4:
                e_1 = _b.sent();
                logger.log("Error loading datas : " + e_1);
                res.redirect("../?msg=" + encodeURI("Whoops ! It seems like an error has occured during the dashboard's loading. Sniffu..."));
                return [2 /*return*/];
            case 5:
                //On donne un nom aux channels dans lesquels il y a des messages prévus
                table.forEach(function (element) {
                    channelRes.forEach(function (channel) {
                        if (channel.id == element.channel_id)
                            element.channel_name = channel.name;
                    });
                });
                //Sort message in the chronologic way
                table.sort(function (a, b) {
                    var timestamp_a, timestamp_b;
                    if (a.timestamp)
                        timestamp_a = a.timestamp;
                    else {
                        var cronInstance = new Cron();
                        cronInstance.fromString(a.cron);
                        var scheduler = cronInstance.schedule();
                        timestamp_a = Math.floor(scheduler.next().unix() / 60);
                    }
                    if (b.timestamp)
                        timestamp_b = b.timestamp;
                    else {
                        var cronInstance = new Cron();
                        cronInstance.fromString(b.cron);
                        var scheduler = cronInstance.schedule();
                        timestamp_b = Math.floor(scheduler.next().unix() / 60);
                    }
                    if (timestamp_a < timestamp_b)
                        return -1;
                    else
                        return 1;
                });
                zones = {};
                for (_i = 0, _a = momentTz.tz.names(); _i < _a.length; _i++) {
                    el = _a[_i];
                    zoneEl = momentTz.tz.zone(el);
                    offset = zoneEl.utcOffset(new Date().getTime());
                    zoneName = zoneEl.name.split("/");
                    name_1 = (zoneName[zoneName.length - 2] || "") + " : " + zoneName[zoneName.length - 1] + " \u2192 UTC" + (Math.floor(offset / 60) > 0 ? "+" : "") + Math.floor(offset / 60);
                    zones[name_1] = offset;
                }
                peopleData = peopleRes.map(function (val, index) {
                    return {
                        username: val.user.username,
                        id: val.user.id,
                        nickname: val.nickname
                    };
                });
                rolesData = rolesRes.map(function (val, index) {
                    if (val.name[0] == "@")
                        val.name = val.name.substring(1, val.name.length);
                    return {
                        username: val.name,
                        id: val.id
                    };
                }).filter(function (el, index) { return el.username != "everyone"; });
                channelData = channelRes.map(function (val, index) {
                    return {
                        name: val.name,
                        id: val.id
                    };
                });
                res.render('dashboard', {
                    header: req.headerData,
                    table: table,
                    channel_list: channelData,
                    people_list: peopleData,
                    roles_list: rolesData,
                    guild_data: guildRes,
                    cdn: process.env.CDN_ENDPOINT,
                    now_hour: String(new Date().getHours()) + ":" + String(new Date().getMinutes() + 2),
                    timezone_data: zones,
                    guildTimezone: guildDB.timezone
                });
                return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
