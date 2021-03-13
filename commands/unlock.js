const Discord = require('discord.js');
module.exports.run = async (client, message, args, utils) => {
  let config = await utils.yml("./config.yml")
  let lang = await utils.yml("./lang.yml")
  if(config.Mod_UnLock_Role === 'Null') return;
  let role = message.guild.roles.cache.find(r => r.name.toLowerCase() == config.Mod_UnLock_Role.toLowerCase());
  if (!role) return message.channel.send((lang.Err_Role_Message).replace("{role}", config.Mod_UnLock_Role))
  let hasPermission = message.member.roles.cache.find(role => role.name == config.Mod_UnLock_Role);
  //let hasPermission = message.member.roles.cache.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
  if (!hasPermission) return message.reply((lang.No_Role_Message).replace("{role}", config.Mod_UnLock_Role))
  let member = message.guild.roles.cache.find(r => r.name.toLowerCase() == config.Join_Role.toLowerCase())
message.channel.updateOverwrite(message.guild.id, 
  {
    SEND_MESSAGES: true
   });
  if(member) {
    message.channel.updateOverwrite(message.author.id, {
    SEND_MESSAGES: true
  })};
  let lock = new Discord.MessageEmbed()
    .setColor(config.Mod_Embed_Color)
    .setTitle("❌ Deactivated")
    .setDescription("Lock Down Mode Disabled")
   // .addField("Lock Down Mode Enabled")

  if(config.Lock_Commmand_Embed_Special_Color == `false`) {
    lock.setColor(config.Theme_Color)
  }
  message.channel.send(lock);
}
// Aliases, name, description and usage
module.exports.help = {
    aliases: [],
    name: 'unlock',
    description: 'unlock the discord channel!',
    usage: 'PREFIXunlock'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Moderation', /* You can make a category help command with this. */
    category_emoji: "⚒️" /* the catagory emoji */
}