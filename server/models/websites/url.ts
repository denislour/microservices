"use strict";

import { DataTypes } from "sequelize";

import db from "../index.js";

import type { Url as UrlType } from "../../../digitalniweb-types/models/websites.js";

const Url = db.define<UrlType>(
	"Url",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				len: [4, 255],
			},
		},
		WebsiteId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
	},
	{
		timestamps: false, // createdAt, updatedAt
		paranoid: false, // deletedAt
	}
);

export default Url;
