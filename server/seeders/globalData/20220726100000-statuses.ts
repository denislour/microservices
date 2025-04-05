import { QueryInterface } from "sequelize";

import Status from "../../models/globalData/status.js";

import type { microservices } from "../../../digitalniweb-types/index.js";
const microservice: Array<microservices> = ["billings"];

export default {
	up: async (queryInterface: QueryInterface): Promise<void> => {
		if (
			!microservice.includes(
				process.env.MICROSERVICE_NAME as microservices
			)
		)
			return;
		await queryInterface.sequelize.transaction(async (transaction) => {
			try {
				await Status.create(
					{
						name: "pending",
					},
					{
						transaction,
					}
				);
				await Status.create(
					{
						name: "done",
					},
					{
						transaction,
					}
				);
				await Status.create(
					{
						name: "error",
					},
					{
						transaction,
					}
				);
				await Status.create(
					{
						name: "info",
					},
					{
						transaction,
					}
				);
				await Status.create(
					{
						name: "success",
					},
					{
						transaction,
					}
				);
				await Status.create(
					{
						name: "warning",
					},
					{
						transaction,
					}
				);
			} catch (error) {
				console.log(error);
			}
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
			try {
				await queryInterface.bulkDelete(
					Status.tableName,
					{},
					{ transaction }
				);
			} catch (error) {
				console.log(error);
			}
		});
	},
};
