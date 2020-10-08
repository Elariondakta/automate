import DBManager from "../src/utils/DBManager";
import * as path from "path";
import fetch from "node-fetch";
import * as fs from "fs";
import { MessageType } from "../src/models/MessageModel";
import * as dotenv from "dotenv";
console.log(dotenv);
dotenv.config();

const dbManager = new DBManager();

dbManager.init().then(dlUsers);
process.chdir(path.join(process.cwd(), "temp/guilds"));



async function dlUsers() {
	const users = await (await fetch("https://automatebot.app/users.json")).json();
	for (const userId of Object.keys(users)) {
    const user = users[userId];
    try {
      await dbManager.User.upsert({
        id: userId,
        ...user
      });
    } catch (e) {
      console.log(e);
    }
	}
	loadGuilds();
}

async function loadGuilds() {
	const folders = fs.readdirSync(".");
	
	for (const guildId of folders) {
		const data = JSON.parse(fs.readFileSync(path.join(guildId, "data.json")).toString());
		console.log("data size", data.toString().length);

		await dbManager.Guild.upsert({
			id: guildId,
			guild_owner_id: data.guild_owner_id,
			refresh_token: data.refresh_token,
			timezone: data.timezone,
			timezone_code: data.timezone_code,
			token: data.token,
			token_expires: data.token_expires
		});
		for (const message of data.ponctual) {
			await dbManager.Message.create({
				...message,
				type: MessageType.Ponctual
			})
		}
		for (const message of data.freq) {
			await dbManager.Message.create({
				...message,
				type: MessageType.Frequential
			})
		}
	}
}
