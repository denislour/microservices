"use strict";

import { DataTypes } from "sequelize";

import db from "../index.js";

import type { Website as WebsiteType } from "../../../digitalniweb-types/models/websites.js";

import Url from "./url.js";
import WebsiteLanguageMutation from "./websiteLanguageMutation.js";
import WebsiteModule from "./websiteModule.js";

const Website = db.define<WebsiteType>(
	"Website",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		uuid: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		contentMsId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		MainUrlId: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		usersMsId: {
			type: DataTypes.INTEGER,
		},
		userId: {
			type: DataTypes.INTEGER,
		},
		appId: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		mainLanguageId: {
			type: DataTypes.INTEGER,
		},
		emailsMsId: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
		},
		testingMode: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
		},
		paused: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
		},
	},
	{
		timestamps: true,
		paranoid: true,
	}
);

/**
 * beforeCreate hooks are applied after model validation, that is why I need to use beforeValidate hook.
 */
Website.addHook("beforeValidate", "createUUID", (website: WebsiteType) => {
	if (!website.uuid) website.uuid = crypto.randomUUID();
});

Website.addHook("afterFind", "addwebsitesMsId", (website: WebsiteType) => {
	if (website) website.websitesMsId = Number(process.env.MICROSERVICE_ID);
});

Website.addHook(
	"afterUpdate",
	"createUrlAddAlias",
	async (website: WebsiteType, options) => {
		let changed = website.changed(); // array of changed properties

		if (changed && !changed.includes("MainUrlId")) return;

		let previousMainUrlId = website.previous().MainUrlId;
		if (previousMainUrlId !== undefined) return;

		let currentMainUrlId = website.getDataValue("MainUrlId");

		let addedMainUrl = await Url.findOne({
			where: { id: currentMainUrlId },
			transaction: options.transaction,
		});

		if (!addedMainUrl) return;
		await website.addAliases([addedMainUrl], {
			transaction: options.transaction,
		});
	}
);

// I need to use other name than 'url' (I'll use 'alias'), because otherwise it conflicts on names and special methods ('.addUrl' etc.) don't work because of the two way bindings. Url <-> Website . I need to use '.addAlias' etc.
Website.hasMany(Url, { as: "Aliases" });

Website.hasMany(WebsiteLanguageMutation);

Website.hasMany(WebsiteModule);
WebsiteModule.belongsTo(Website);

Website.belongsTo(Url, { as: "MainUrl" });

export default Website;
