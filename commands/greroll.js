const fs = require("fs");
const Discord = require("discord.js")

module.exports.run = async (client, message, args, utils) => {
let config = await utils.yml("./config.yml")
//const config = utils.config
if (config.Giveaway_System !== "true") return message.channel.send("Giveaway system isn't Enabled, Enable it in \`\`Config.yml\`\`")

    let role = message.guild.roles.cache.find(r => r.name.toLowerCase() == config.Giveaway_ReRoll_Required_Role.toLowerCase())
    if(!role) return message.channel.send(`Command failed. Check console.`).then(console.log(`ERROR! The ${config.Giveaway_ReRoll_Required_Role} role was not found, please create it.`))
  let hasPermission = message.member.roles.cache.find(role => role.name == config.Giveaway_Create_Required_Role);
  if (!hasPermission) return message.reply("You don't have the needed perms for that");
    fs.readFile('./data/giveaways.json', 'utf-8', function (err, giveaways) {
        if (err) throw err;
        giveaways = JSON.parse(giveaways);
        let giveaway;
        if (!args[0]) giveaway = giveaways.sort((a, b) => b.start - a.start)[0];
        else {
            let g = giveaways.find(g => g.name.toLowerCase() == args.join(" ").toLowerCase());
            if (!g) return message.reply("No giveaway found with name ``" + args.join(" ") + "``");
            giveaway = g;
        }
        if (!giveaway.ended) return message.reply("That giveaway has not ended yet!");
        if (giveaway.reactions.length < 1) return message.reply("No one has entered the giveaway!");
        let winner = giveaway.reactions[~~(Math.random() * giveaway.reactions.length)];

        let channel = message.guild.channels.cache.find(c => c.name.toLowerCase() == config.Giveaway_Channel.toLowerCase());
        if(!channel) return console.log(`ERROR! The ${config.Giveaway_Channel} channel was not found, please create it.`).then(message.channel.send(`Command failed. Check console for more info.`));
            channel.send(`🎉 Congratulations to <@${winner}> for winning \`\`${giveaway.name}\`\``);
})
}
                
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['grr'],
    name: 'greroll',
    description: 'pong wow!',
    usage: 'PREFIXping'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Giveaways', /* You can make a category help command with this. */
    category_emoji: "🎉" /* the catagory emoji */
}