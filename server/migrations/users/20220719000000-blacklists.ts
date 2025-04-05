import { QueryInterface, DataTypes } from "sequelize";

import Blacklist from "./../../models/users/blacklist.js";
import type { Blacklist as BlacklistType } from "./../../../digitalniweb-types/models/users.js";

import type { microservices } from "../../../digitalniweb-types/index.js";
const microservice: Array<microservices> = ["users"];

export default {
	up: async (queryInterface: QueryInterface): Promise<void> => {
		if (
			!microservice.includes(
				process.env.MICROSERVICE_NAME as microservices
			)
		)
			return;
		await queryInterface.sequelize.transaction(async (transaction) => {
			return await queryInterface.createTable<BlacklistType>(
				Blacklist.tableName,
				{
					id: {
						allowNull: false,
						autoIncrement: true,
						primaryKey: true,
						type: DataTypes.INTEGER,
					},
					service: {
						type: DataTypes.STRING,
						allowNull: false,
					},
					type: {
						type: DataTypes.STRING,
						allowNull: false,
					},
					value: {
						type: DataTypes.STRING,
						allowNull: false,
					},
					reason: {
						type: DataTypes.STRING,
					},
					blockedTill: {
						type: DataTypes.DATE,
					},
					otherData: {
						type: DataTypes.JSON,
					},
					createdAt: {
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
			return await queryInterface.dropTable(Blacklist.tableName, {
				transaction,
			});
		});
	},
};
