import { QueryInterface, DataTypes } from "sequelize";

import Language from "../../models/globalData/language.js";
import type { Language as LanguageType } from "../../../digitalniweb-types/models/globalData.js";

import type { microservices } from "../../../digitalniweb-types/index.js";
const microservice: Array<microservices> = ["globalData"];

export default {
	up: async (queryInterface: QueryInterface): Promise<void> => {
		if (
			!microservice.includes(
				process.env.MICROSERVICE_NAME as microservices
			)
		)
			return;
		await queryInterface.sequelize.transaction(async (transaction) => {
			return await queryInterface.createTable<LanguageType>(
				Language.tableName,
				{
					id: {
						allowNull: false,
						autoIncrement: true,
						primaryKey: true,
						type: DataTypes.INTEGER,
					},
					code: {
						allowNull: false,
						type: DataTypes.STRING(7),
						unique: true,
					},
					name: {
						allowNull: false,
						type: DataTypes.STRING(63),
					},
					icon: {
						allowNull: false,
						type: DataTypes.STRING(2048),
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
			return await queryInterface.dropTable(Language.tableName, {
				transaction,
			});
		});
	},
};
