const Discord = require("discord.js")

module.exports.run = async (client, message, args, utils) => {
const request = require('snekfetch');

let config = await utils.yml("./config.yml")
let ip;

if(args[0]) {
ip = args[0]
}else {
ip = config.Server_IP
}

if(ip === "Null") return message.channel.send("Status isn't Enabled, Enable it in \`\`Config.yml\`\`");
request.get(`https://api.mcsrvstat.us/2/${ip}`).send({ usingGoodRequestLibrary: true })
.then(r => {
let motd;
let submotd;
let players;
let max;
let version;
let image;
let site;
if(r.body.online == false) {
motd = "Server is offline."
submotd = ""
players = "0"
max = "0"
version = "NONE"
}else {
motd = r.body.motd.raw[0]
submotd = r.body.motd.raw[1]
console.log(motd)
players = r.body.players.online
max = r.body.players.max
version = r.body.version
image = `https://api.minetools.eu/favicon/${ip}`
}
console.log(r.body)
let msg = utils.color(motd, submotd) 


let Embed = new Discord.MessageEmbed()
      .setTitle(`**${ip}** (${players}/${max})`)
      .setDescription(msg)
      .setColor(config.Server_Embed_Color)
      .setTimestamp();
if(image) Embed.setThumbnail(`${image}`);
if(config.Site_Link !== "Null") Embed.setURL(config.Site_Links);
message.channel.send(Embed)

});


}
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['st'],
    name: 'status',
    description: 'pong wow!',
    usage: 'PREFIXping'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Utils', /* You can make a category help command with this. */
    category_emoji: "📎" /* the catagory emoji */
}