"use strict";

import { DataTypes } from "sequelize";

import db from "../index.js";

import type { CurrencyLanguage as CurrencyLanguageType } from "../../../digitalniweb-types/models/globalData.js";
import Currency from "./currency.js";
import Language from "./language.js";

const CurrencyLanguage = db.define<CurrencyLanguageType>(
	"CurrencyLanguage",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		CurrencyId: {
			type: DataTypes.INTEGER,
			references: {
				model: Currency.tableName,
				key: "id",
			},
		},
		LanguageId: {
			type: DataTypes.INTEGER,
			references: {
				model: Language.tableName,
				key: "id",
			},
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		timestamps: false, // createdAt, updatedAt
		paranoid: false, // deletedAt
	}
);

CurrencyLanguage.belongsTo(Currency);

export default CurrencyLanguage;
