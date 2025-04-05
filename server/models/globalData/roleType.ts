"use strict";

import { DataTypes } from "sequelize";

import db from "../index.js";

import type { RoleType as RoleTypeType } from "../../../digitalniweb-types/models/globalData.js";

const RoleType = db.define<RoleTypeType>(
	"RoleType",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: false, // createdAt, updatedAt
		paranoid: false, // deletedAt
	}
);

export default RoleType;
