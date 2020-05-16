const Discord = require('discord.js');
const dotenv = require("dotenv");
const Cron = require("cron-converter");
const fs = require("fs");
const bot = new Discord.Client();
let messageSentAverage = 0;

dotenv.config();

bot.login(process.env.TOKEN_BOT);
setInterval(sendStats, 1000*60*60);     //Envoi des stats chaque heure

process.on("message", message => {
    console.log(`Message from server : ${message}`);
    const params = new URLSearchParams(message.split("?")[1]);
    const url = message.split("?")[0];
    if (url == "request_channels" && params.get("id")) {
        try {
            const dataToSend = bot.guilds.cache.get(params.get("id")).channels.cache;
            process.send("response_channels?id="+params.get("id")+"\n"+JSON.stringify(dataToSend));
        } catch (error) {
            console.log("Error bot : " + error);
            process.send("response_channels?id="+params.get("id")+"\n ");
        }
    }
    else if (url == "request_guild" && params.get("id")) {
        try {
            const dataToSend = bot.guilds.cache.get(params.get("id"));
            process.send("response_guild?id="+params.get("id")+"\n"+JSON.stringify(dataToSend));
        } catch (error) {
            console.log("Error bot : " + error);
            process.send("response_guild?id="+params.get("id")+"\n ");
        }
    } else if (url == "request_people" && params.get("id")) {
        try {
            const dataToSend = bot.guilds.cache.get(params.get("id")).members.cache;
            process.send("response_people?id="+params.get("id")+"\n"+JSON.stringify(dataToSend));
        } catch (error) {
            console.log("Error bot : " + error);
            process.send("response_people?id="+params.get("id")+"\n ");   
        }
    } 
    else {
        console.log(`Error parsing message : ${message}`);
    }
});

bot.on('ready', () => {
    if (process.send) 
        process.send("started");
    else
        fs.writeFileSync("bot.log", "Error pipe between server and bot");

    console.info(`Logged in as ${bot.user.tag} !\n`);

    //On attend le passage à la prochaine minute pour être le plus syncro possible
    const oldMinute = Math.floor((new Date().getTime()/1000)/60)*60;
    console.log(`Actual minute : ${new Date().getMinutes()}`);
    console.log("Waiting for new minute to start cron watcher");
    const intervalId = setInterval(() => {
        if (Math.floor((new Date().getTime()/1000)/60)*60 - 15 > oldMinute) {
            console.log(`\n\nNew minute detected, Starting cron Watcher at minute ${new Date().getMinutes()}`);
            bot.setInterval(cronWatcher, 1000*60);  //Si on est passé à une nouvelle minute on lance le cronWatcher
            clearInterval(intervalId);
        }
    }, 10);
});

bot.on("guildDelete", guild => {
    fs.rmdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guild.id + "/", {recursive: true});
});

bot.on("guildCreate", guild => {
    try {
        guild.systemChannel.send(`Hey ! I'm Spam-bot, to give orders you need to go on this website : https://spam-bot.app.\nI can send your messages at anytime of the day event when you're not here to supervise me ;)`);
    } catch(e) {
        console.log("Added bot but no systemChannel has been specified...");
    }
});

function cronWatcher() {
    let i = 0;
    fs.readdirSync(__dirname + "/.." + process.env.DB_GUILDS + "/").forEach(guildId => {
        //Pour chaque guild on regarde si on doit envoyer un message
        const guildData = JSON.parse(fs.readFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json"));
        const timestamp = Math.floor((Date.now()/1000)/60);
        let indexToDeletePonctual = [];
        guildData.ponctual.forEach((ponctualEvent, index) => {
            if (ponctualEvent.timestamp == timestamp) {
                const date = new Date();
                try {
                    bot.channels.cache.get(ponctualEvent.channel_id).send(ponctualEvent.sys_content || ponctualEvent.message).catch(e => {
                        console.log(`Error sending message (probably admin rights) to channel : ${ponctualEvent.channels_id}`);
                    });
                    console.log(`New punctual message sent at ${date.getDate()}/${date.getUTCMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`);
                } catch (e) {
                    console.log(`Error sending message channel id ${ponctualEvent.channels_id} not found`);
                }
                i++;
                indexToDeletePonctual.push(index);
            }
        });
        guildData.freq.forEach((freqEvent) => {
            const cronInstance = new Cron();
            cronInstance.fromString(freqEvent.cron);
            const scheduler = cronInstance.schedule();
            const timestampToExec = Math.floor(scheduler.next().unix()/60);
            // console.log(`freq next  : ${timestampToExec}`);
            // console.log(`Actual : ${timestamp}`);

            if (timestampToExec == timestamp) {
                try {
                    bot.channels.cache.get(freqEvent.channel_id).send(freqEvent.sys_content || freqEvent.message).catch(e => {
                        console.log(`Error sending message (probably admin rights) to channel : ${freqEvent.channel_id}`);
                    });
                    console.info(`New frequential message sent to ${bot.channels.cache.get(freqEvent.channel_id).name} in ${bot.channels.cache.get(freqEvent.channel_id).guild.name}`);
                } catch (e) {
                    //TODO: Supprimer les messages concernant ce channel qui n'existe plus
                    console.log(`Error sending message channel id ${freqEvent.channels_id} in guild id ${guildId}`);
                }
                i++;
            }
        });
        indexToDeletePonctual.forEach((index) => {
            const ponctualEvent = guildData.ponctual[index];
            delete guildData.ponctual[index];
            guildData.deleted.push(ponctualEvent);
        });
        if (indexToDeletePonctual.length > 0) {
            guildData.ponctual = guildData.ponctual.filter(element => element != null);
            fs.writeFileSync(__dirname + "/.." + process.env.DB_GUILDS + "/" + guildId + "/data.json", JSON.stringify(guildData));
        }
    });
    console.log(`<----------- Sent ${i} messages ----------->`);
    messageSentAverage = Math.ceil((messageSentAverage + i)/2); //Calcul de moyenne de messages envoyé chaque minute
}

async function sendStats() {
    const channel = bot.channels.cache.get("702970284034097192");
    const lengthServer = fs.readdirSync(__dirname+"/.."+process.env.DB_GUILDS).length;
    const lengthUsers = Object.keys(JSON.parse(fs.readFileSync(__dirname + "/../data/users.json"))).length;
    channel.send(`Nombre de serveurs : **${lengthServer}**`);
    channel.send(`Nombre d'utilisateurs : **${lengthUsers}**`);
    channel.send(`Moyenne de messages envoyé par minutes : **${messageSentAverage}**`);
    messageSentAverage = 0;
}