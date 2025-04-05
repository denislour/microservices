"use strict";

import { DataTypes } from "sequelize";

import db from "../index.js";

import type { Invoice as InvoiceType } from "../../../digitalniweb-types/models/billings.js";
import Currency from "../globalData/currency.js";
import Status from "../globalData/status.js";
import CreditBalanceLog from "./creditBalanceLog.js";

const Invoice = db.define<InvoiceType>(
	"Invoice",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		invoiceNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		currencyId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		statusId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		CreditBalanceLogId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		dueDate: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		timestamps: true, // createdAt, updatedAt
		paranoid: true, // deletedAt
	}
);

Invoice.belongsTo(Currency);
Invoice.belongsTo(Status);
Invoice.belongsTo(CreditBalanceLog);

export default Invoice;
