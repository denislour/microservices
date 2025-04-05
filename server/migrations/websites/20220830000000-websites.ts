import { QueryInterface, DataTypes } from "sequelize";

import Website from "../../models/websites/website.js";
import type { Website as WebsiteType } from "../../../digitalniweb-types/models/websites.js";

import type { microservices } from "../../../digitalniweb-types/index.js";
const microservice: Array<microservices> = ["websites"];

export default {
	up: async (queryInterface: QueryInterface): Promise<void> => {
		if (
			!microservice.includes(
				process.env.MICROSERVICE_NAME as microservices
			)
		)
			return;
		await queryInterface.sequelize.transaction(async (transaction) => {
			return await queryInterface.createTable<WebsiteType>(
				Website.tableName,
				{
					id: {
						allowNull: false,
						autoIncrement: true,
						primaryKey: true,
						type: DataTypes.INTEGER,
					},
					uuid: {
						type: DataTypes.UUID,
						// defaultValue: DataTypes.UUIDV4, // this doesn't work in MariaDB, hooks on model are used instead
						allowNull: false,
					},
					MainUrlId: {
						type: DataTypes.INTEGER,
						// Even though the reference is true, I have reference Website -> Url and Url -> Website, so there is DB conflict. I can't reference something that doesn't exist yet. That's why I use it only in Url migration, because I want to be able to use onDelete Cascade there. I don't need it to be constrained here. The association is made by model, which works fine.
						/* references: {
							model: Url.tableName,
							key: "id",
						}, */
						allowNull: true,
					},
					contentMsId: {
						type: DataTypes.INTEGER.UNSIGNED,
						allowNull: false,
					},
					usersMsId: {
						type: DataTypes.INTEGER.UNSIGNED,
						allowNull: false,
					},
					userId: {
						type: DataTypes.INTEGER,
					},
					appId: {
						type: DataTypes.INTEGER,
						allowNull: false,
					},
					mainLanguageId: {
						type: DataTypes.INTEGER.UNSIGNED,
						allowNull: false,
					},
					emailsMsId: {
						type: DataTypes.INTEGER.UNSIGNED,
						allowNull: true,
					},
					testingMode: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 1,
					},
					paused: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0,
					},
					active: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 1,
					},
					createdAt: {
						allowNull: false,
						type: DataTypes.DATE,
					},
					updatedAt: {
						allowNull: false,
						type: DataTypes.DATE,
					},
					deletedAt: {
						type: DataTypes.DATE,
					},
				},
				{
					charset: "utf8mb4",
					collate: "utf8mb4_unicode_ci",
					transaction,
				}
			);
		});
	},

	down: async (queryInterface: QueryInterface): Promise<void> => {
		if (
			!microservice.includes(
				process.env.MICROSERVICE_NAME as microservices
			)
		)
			return;
		await queryInterface.sequelize.transaction(async (transaction) => {
			return await queryInterface.dropTable(Website.tableName, {
				transaction,
			});
		});
	},
};
