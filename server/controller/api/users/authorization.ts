import type { Request, Response, NextFunction } from "express";
// import Privilege from "../../../models/globalData/action.js";
// import Role from "../../../models/globalData/role.js";

// import {
// 	Role as RoleType,
// 	Action as PrivilegeType,
// } from "../../../../digitalniweb-types/models/globalData.js";

// import db from "../../../models/index.js";
// import { WhereOptions } from "sequelize";
// import type { authorizationListType } from "../../../../digitalniweb-types/authorization/index.js";

export const allList = async function (req: Request, res: Response) {
	res.send({}); // delete this

	// !!! FROM HERE DOWN ALL THIS SHOULD BE IN GLOBAL API CONTROLLER I GUESS
	// select: roles/privileges/(all)
	// type: user/admin/(all)
	// const { select = "all", type = "all" } = req.query;
	// let data = await db.transaction(async (transaction) => {
	// 	let data = [] as Array<
	// 		Promise<RoleType[]> | Promise<PrivilegeType[]>
	// 	>;
	// 	let where: WhereOptions<RoleType> = {};
	// 	if (type !== "all") where.type = type as string;
	// 	if (select === "all" || select === "roles")
	// 		data.push(
	// 			Role.findAll({
	// 				where,
	// 				paranoid: true, // items with deletedAt set won't occur in search result
	// 				transaction,
	// 			})
	// 		);
	// 	if (select === "all" || select === "privileges")
	// 		data.push(
	// 			Privilege.findAll({
	// 				where,
	// 				paranoid: true, // items with deletedAt set won't occur in search result
	// 				transaction,
	// 			})
	// 		);
	// 	if (data.length === 0) return false;
	// 	let loadedList = await Promise.all(data);
	// 	let list = {} as authorizationListType;
	// 	if (select === "all") {
	// 		list.roles = loadedList[0] as RoleType[];
	// 		list.privileges = loadedList[1] as PrivilegeType[];
	// 	} else {
	// 		list[select as keyof authorizationListType] =
	// 			loadedList[0] as RoleType[] extends RoleType[]
	// 				? RoleType[]
	// 				: PrivilegeType[];
	// 	}

	// 	return list;
	// });
	// res.send(data);
};
