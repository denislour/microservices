import User from "../models/users/user.js";
import UAParser from "ua-parser-js";
import validator from "validator";
import { Op, literal } from "sequelize";
import type { Order } from "sequelize";
import type { Request, Response, NextFunction } from "express";

import type {
	loginAttempt,
	loginInformation,
} from "../../digitalniweb-types/index.js";

// import sleep from "../../digitalniweb-custom/functions/sleep.js";
import LoginLog from "../models/users/loginLog.js";
import Blacklist from "../models/users/blacklist.js";

import wrongLoginAttempt from "../../custom/helpers/wrongLoginAttempt.js";

const loginAntispam = function () {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			let loginInfo = req.body as loginInformation;

			let userAgent = UAParser(loginInfo.ua);

			if (
				loginInfo.password.length < 7 ||
				loginInfo.email == "" ||
				!validator.isEmail(loginInfo.email) ||
				!userAgent.browser.name ||
				!userAgent.engine.name ||
				!userAgent.os.name ||
				!loginInfo.ua ||
				userAgent.ua != loginInfo.ua ||
				!req.ip
			) {
				// these are incorrect logins... these shouldn't be possible to execute via normal behaviour. Ignore these
				// await sleep(); // default 1000ms
				next({
					type: "authentication",
					code: 401,
					message: "Login authentication has wrong information!",
				});
				return;
				// wrongLoginAttempt(req, next, loginAttempt, {
				// 	message:
				// 		"Another login attempts will cause IP address ban!",
				// 	messageTranslate: "LoginErrorNextAttemptIPBan",
				// 	loginAttemptsCount,
				// 	maxLoginAttempts,
				// 	blockedTill: timeSpanTooManyAttempts,
				// });
				// return;
			}
			let order: Order = [
				literal("`Blacklist`.`blockedTill` IS NULL DESC"),
				["blockedTill", "DESC"],
			];

			let limit = 3; // limit I let same IP address perform an attack - I want to still remain the IP whitelisted till there is 'limit' confirmed attacks from multiple sources (changing user agent or some other shananigans). If the atacker is noob I can let the IP whitelisted for others
			let blacklistedUser: InstanceType<typeof Blacklist> | null =
				await Blacklist.findOne({
					attributes: ["blockedTill", "reason"],
					where: {
						blockedTill: {
							[Op.or]: {
								[Op.gt]: new Date(),
							},
						},
						service: "login",
						type: "userMail",
						value: loginInfo.email,
					},
				});
			if (blacklistedUser) {
				next({
					type: "authentication",
					code: 401,
					message: "Your account was blocked.",
					data: {
						date: blacklistedUser.blockedTill,
						reason: blacklistedUser.reason,
					},
				});
				return;
			}
			let blacklistedIP: Array<InstanceType<typeof Blacklist>> | null =
				await Blacklist.findAll({
					attributes: ["blockedTill", "reason", "otherData"],
					where: {
						blockedTill: {
							[Op.gt]: new Date(),
						},
						service: "login",
						type: "IP",
						value: req.ip,
					},
					paranoid: true,
					order,
					limit,
				});

			let thisRecord = blacklistedIP.find(
				(blacklist) => blacklist?.otherData?.userAgent == userAgent.ua
			);
			if (thisRecord) {
				// await sleep();
				next({
					type: "authentication",
					code: 401,
					message: "Your IP address was blocked.",
					data: {
						message: "Your IP address was blocked.",
						blockedTill: thisRecord.blockedTill,
					},
				});
				return;
			}
			if (blacklistedIP.length >= limit) {
				// if there is multiple black listed same IP records deny logging in to (unfortunately) all users / accounts on this IP
				// if there was only 1 intruder on the same IP (and he was stupid enough he wouldn't pass the userAgent test, thus the amount of same IP address in blacklist wouldn't exceed the limit) don't punish all
				// await sleep();

				next({
					type: "authentication",
					code: 401,
					message: "Your IP address was blocked",
					data: {
						date: blacklistedIP[0].blockedTill,
						reason: blacklistedIP[0].reason,
					},
				});
				return;
			}
			let loginAttempt: loginAttempt = {
				userLogin: loginInfo.email,
				UserId: null,
				ip: req.ip as string,
				userAgent,
				successful: true,
			};

			let maxLoginAttempts = 4; // max failed login attempts for same login / account
			let bruteForceLoginAttempts = 8; // from now consider this an attack on one login / account
			let timeSpanMinutes = 10;
			let bruteForceIPLoginAttempts =
				(maxLoginAttempts * timeSpanMinutes) / 2; // from now consider this an attack from one IP on multiple accounts. Dividing number 2 is just arbitrary coeficient to lower the count so the result remains time times login count dependent. This means if there is 20 (account independent) bad logins in 10 minutes from one IP it is considered an attack.
			let bruteForceUAIPLoginAttempts =
				(maxLoginAttempts * timeSpanMinutes) / 4; // from one IP and same UserAgent, multiple accounts. Dividing number 4 is just arbitrary coeficient same as in bruteForceIPLoginAttempts but higher to lower the amount of attempts because we know attacker's user agent
			let bruteForceIPLoginAttemptsPerDay = 60; // from 1 IP per day

			let timeSpan = new Date();
			timeSpan.setMinutes(timeSpan.getMinutes() - timeSpanMinutes); // now - 10 minutes

			let timeSpanTooManyAttempts = new Date();
			timeSpanTooManyAttempts.setMinutes(
				timeSpanTooManyAttempts.getMinutes() + timeSpanMinutes
			); // now + 10 minutes

			let timeSpanDay = new Date();
			timeSpanDay.setHours(timeSpanDay.getHours() - 24); // now - 1 day

			let loginAttemptsCounts = [];
			// ip login count
			// loginAttemptsCounts[0] => IPLoginAttemptsCount
			loginAttemptsCounts.push(
				LoginLog.count({
					where: {
						ip: req.ip,
						successful: 0,
						createdAt: {
							[Op.gte]: timeSpan,
						},
					},
				})
			);

			// ip and ua count
			// loginAttemptsCounts[1] => UAIPLoginAttemptsCount
			loginAttemptsCounts.push(
				LoginLog.count({
					where: {
						ip: req.ip,
						successful: 0,
						"userAgent.ua": { [Op.eq]: userAgent.ua }, // because whole object comparison doesn't work
						createdAt: {
							[Op.gte]: timeSpan,
						},
					},
				})
			);

			// user / account login count
			// loginAttemptsCounts[2] => loginAttemptsCount
			loginAttemptsCounts.push(
				LoginLog.count({
					where: {
						userLogin: loginInfo.email,
						successful: 0,
						createdAt: {
							[Op.gte]: timeSpan,
						},
					},
				})
			);
			// ip login count
			// loginAttemptsCounts[3] => IPLoginAttemptsCountInDay
			loginAttemptsCounts.push(
				LoginLog.count({
					where: {
						ip: req.ip,
						successful: 0,
						createdAt: {
							[Op.gte]: timeSpanDay,
						},
					},
				})
			);

			loginAttemptsCounts = await Promise.all(loginAttemptsCounts);

			let [
				IPLoginAttemptsCount,
				UAIPLoginAttemptsCount,
				loginAttemptsCount,
				IPLoginAttemptsCountInDay,
			] = loginAttemptsCounts;
			loginAttemptsCount++; // because first time it is 0
			let bruteforcinglogin =
				loginAttemptsCount >= bruteForceLoginAttempts; // bruteforcing certain account
			let bruteforcinglogins =
				IPLoginAttemptsCount >= bruteForceIPLoginAttempts; // from 1 IP bruteforcing multiple accounts
			let bruteforcingualogins =
				UAIPLoginAttemptsCount >= bruteForceUAIPLoginAttempts; // from 1 IP bruteforcing multiple accounts
			let bruteforcingloginsperday =
				IPLoginAttemptsCountInDay >= bruteForceIPLoginAttemptsPerDay;
			if (
				bruteforcinglogin ||
				bruteforcinglogins ||
				bruteforcingualogins ||
				bruteforcingloginsperday
			) {
				// get notified - send mail?
				// blacklist IP
				let blockedTill = new Date();
				let daysToBanIP = 1;
				blockedTill.setHours(blockedTill.getHours() + daysToBanIP * 24);

				let reason = "brute forcing";
				if (bruteforcinglogin) reason = "brute forcing";

				await Blacklist.create({
					service: "login",
					type: "IP",
					value: req.ip as string,
					reason,
					otherData: { userAgent: userAgent.ua },
					blockedTill,
				});
				// await sleep();
				next({
					type: "authentication",
					code: 401,
					message: `IP address was just blocked for ${daysToBanIP} day${
						daysToBanIP === 1 ? "" : "s"
					} because of brute forcing logging in.`,
					data: {
						message: "Your IP address was banned",
						messageTranslate: "LoginErrorIPBanned",
						blockedTill: blockedTill,
					},
				});
				return;
			}
			if (loginAttemptsCount >= bruteForceLoginAttempts - 2) {
				wrongLoginAttempt(req, next, loginAttempt, {
					message:
						"Another login attempts will cause IP address ban!",
					messageTranslate: "LoginErrorNextAttemptIPBan",
					loginAttemptsCount,
					maxLoginAttempts,
					blockedTill: timeSpanTooManyAttempts,
				});
				return;
			}

			let existingUserId = await User.findOne({
				attributes: ["id"],
				where: {
					email: loginAttempt.userLogin,
				},
				paranoid: true,
			});

			if (existingUserId) loginAttempt.UserId = existingUserId.id;

			if (loginAttemptsCount >= maxLoginAttempts) {
				wrongLoginAttempt(req, next, loginAttempt, {
					message: `Too many login attempts!`, //<br> You can't login for next ${timeSpanMinutes} minutes, wait and try to log in again after this time past.
					messageTranslate: "LoginErrorTooManyAttempts",
					loginAttemptsCount,
					maxLoginAttempts,
					timeSpanMinutes,
					blockedTill: timeSpanTooManyAttempts,
				});
				return;
			}

			if (!existingUserId) {
				wrongLoginAttempt(req, next, loginAttempt, {
					message: "Wrong login",
					messageTranslate: "LoginErrorWrongLogin",
					loginAttemptsCount,
					maxLoginAttempts,
				});
				return;
			}

			res.locals.antispam = {
				loginAttempt,
				loginAttemptsCount,
				maxLoginAttempts,
			};
			next();
		} catch (error) {
			next({
				error,
				code: 500,
				message: "Error while logging in.",
			});
		}
	};
};

export { loginAntispam };
