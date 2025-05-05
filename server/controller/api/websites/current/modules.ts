import type { Request, Response } from "express";
import { Op, col, fn } from "sequelize";
import WebsiteModule from "../../../../models/websites/websiteModule.js";
import WebsiteLanguageMutation from "../../../../models/websites/websiteLanguageMutation.js";
export const getModulesIds = async function (req: Request, res: Response) {
	let websiteId = req.query.websiteId as string;
	let modulesIds = "modulesIds";
	let idsStringInstance = await WebsiteModule.findOne({
		attributes: [[fn("GROUP_CONCAT", col("moduleId")), modulesIds]],
		where: {
			[Op.and]: [{ active: true }, { WebsiteId: websiteId }],
		},
		paranoid: true,
	});
	let idsString = idsStringInstance?.get(modulesIds) as string;
	let ids: number[] = [];
	if (idsString) ids = idsString.split(",").map(Number);

	res.send(ids);
};
export const getLanguagesIds = async function (req: Request, res: Response) {
	let websiteId = req.query.websiteId as string;
	let languagesIds = "languagesIds";
	let idsStringInstance = await WebsiteLanguageMutation.findOne({
		attributes: [[fn("GROUP_CONCAT", col("languageId")), languagesIds]],
		where: {
			[Op.and]: [{ WebsiteId: websiteId }],
		},
	});
	let idsString = idsStringInstance?.get(languagesIds) as string;
	let ids: number[] = [];
	if (idsString) ids = idsString.split(",").map(Number);

	res.send(ids);
};
