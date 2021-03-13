const ms = require("parse-ms");
const fs = require("fs")

module.exports.run = async (client, message, args, utils) => {
  const config = await utils.yml("./config.yml")
  const lang = await utils.yml("./lang.yml")
  let mutes = require("../data/mutes.json");
  if(config.Mod_Mute_Role === 'Null') return;
  let hasPermission = message.member.roles.cache.find(role => role.name == config.Mod_Mute_Role);
  let role = message.guild.roles.cache.find(r => r.name == config.Mod_Mute_Role)
  if(!role) return message.channel.send(lang.Err_Role_Message.replace("{role}", config.Mod_Mute_Role))
  if(!hasPermission) return message.reply(lang.No_Role_Message.replace("{role}", config.Mod_Mute_Role))
  if(!args[0]) return message.reply(`Usage: ${config.Client_Prefix}mute (user) (length) (reason)`)
  let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
  if(!user) return message.reply(lang.No_Mention_Message)
  if(user.roles.cache.has(role.id)) return message.reply(lang.Mod_User_Already_Muted)
  let muterole = message.guild.roles.cache.find(r => r.name == config.Mod_Muted_Role);
  if(!muterole) message.channel.send(lang.Err_Role_Message.replace("{role}", config.Mod_Muted_Role));
  if(!/\d+.+/.exec(args[1])) return message.reply(lang.Mod_Invalid_Mute_Time);
  let pattern = /(((\d)+(m|M))?((\d)+(h|H))?((\d)+(d|D))?)+/
  if (!pattern.exec(args[1])) return message.reply(lang.Mod_Invalid_Mute_Time);
  let mins = parseInt(args[1].match(/\d+[m]/) !== null ? args[1].match(/\d+[m]/)[0] : 0);
  let days = parseInt(args[1].match(/\d+[d]/) !== null ? args[1].match(/\d+[d]/)[0] : 0);
  let hours = parseInt(args[1].match(/\d+[h]/) !== null ? args[1].match(/\d+[h]/)[0] : 0);
  let msAway = 0;
  if (mins) msAway += mins * 60000;
  if (hours) msAway += hours * 60 * 60000;
  if (days) msAway += days * 24 * 60 * 60000;

  if(days) {
  days = `${days} days, `
  }else {
  days = ""
  }
  if(hours) {
  hours = `${hours} hours, `
  }else {
  hours = ""
  }
  if(mins) {
  mins = `${mins} minutes, `
  }else {
  mins = ""
  }
  let msg = ``
  let reason = args.slice(2).join(" ")
  if(!reason) return message.reply(lang.Mod_Mute_No_Reason)
  await(user.roles.add(muterole));
  mutes.push({
                user: user.id,
                muterole: muterole.id,
                guild: message.guild.id,
                time: Date.now() + msAway
            })
  fs.writeFile("./data/mutes.json", JSON.stringify(mutes), function (err) { if (err) console.log(err) });
  message.channel.send(`<@${user.id}> has been muted for **${days}${hours}${mins}** for ${reason}`);
  setTimeout(function(){
  user.removeRole(muterole.id);
  }, ms(mutetime));
}
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['m'],
    name: 'mute',
    description: 'Mute a certain user !',
    usage: 'PREFIXmute <user> <time (10m/10h/10d)> <reason>'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Moderation', /* You can make a category help command with this. */
    category_emoji: "⚒️" /* the catagory emoji */
}