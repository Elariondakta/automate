const express = require('express');
const fetch = require("node-fetch");
const fs = require("fs");
const router = express.Router();

const ADMINISTRATOR =	0x00000008;
const MANAGE_GUILD = 0x00000020;
/* GET home page. */
router.get('/', async (req, res, next) => {
  const token = JSON.parse(fs.readFileSync(__dirname+"/../data/users.json"))[req.session.userId].access_token;
  const guildReq = await fetch("https://discordapp.com/api/users/@me/guilds", {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (guildReq.status != 200) {
    console.log(`Erreur : ${guildReq.status} ${guildReq.statusText}`);
    res.render('index', {header: req.headerData, error: "I didn't manage to collect all your channels, sniffu..."});
  }
  let guildRes = JSON.parse(await guildReq.text());
  try {
    guildRes = guildRes.filter((el) => {
      if (el.permissions & ADMINISTRATOR || el.permissions & MANAGE_GUILD)
        return true;
      else return false;
    });
  } catch (e) {
    console.error(`Erreur lors de la guildRes.filer : guildResObj : ${guildsRes}`);
    res.render('index', {header: req.headerData, error: "I didn't manage to collect all your channels, sniffu..."});
  }
  guildRes.forEach(element => element.added = fs.existsSync(__dirname+"/../data/guilds/"+element.id+"/data.json"));
  guildRes.sort((a, b) => {if (a.added) return -1; else if (b.added) return 1; else return 0;});
  if (guildRes.length > 0) 
    res.render('index', {header: req.headerData, guilds: guildRes, bot_link: process.env.BOT_LINK});
  else 
    res.render("index", {header: req.headerData, error: "It seems that there is nowhere for me to hop in... Snifffu.\n I'll be able to, if you ask for permissions to be Admin :p"});
});

module.exports = router;
