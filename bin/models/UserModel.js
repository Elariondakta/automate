"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var sequelize_1 = require("sequelize");
var sequelize_2 = require("sequelize");
var UserModel = /** @class */ (function (_super) {
    __extends(UserModel, _super);
    function UserModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UserModel.factory = function (sequelize) {
        var attributes = {
            access_token: {
                type: sequelize_2.DataTypes.STRING(40),
                allowNull: false,
                unique: true
            },
            id: {
                type: sequelize_2.DataTypes.STRING(40),
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            token_timestamp: {
                type: sequelize_2.DataTypes.INTEGER,
                allowNull: false
            },
            refresh_token: {
                type: sequelize_2.DataTypes.STRING(40),
                allowNull: false
            }
        };
        var User = sequelize.define('User', attributes, { timestamps: false });
        return User;
    };
    return UserModel;
}(sequelize_1.Model));
exports.UserModel = UserModel;
