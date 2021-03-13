module.exports.run = async (client, message, args, utils) => {
const Discord = require('discord.js');

if (!message.member.hasPermission('KICK_MEMBERS'))
            return message.channel.send("Insufficient permissionss (Requires `KICK_MEMBERS`)")
        const member = message.mentions.members.first();
        if (!member)
            return message.channel.send("You have not mentioned a user")
        if (!member.kickable)
            return message.channel.send("You can't kick this user")
        const reason = args.slice(1).join(" ")
        if (member) {
            if (!reason) return member.kick().then(member => {
                message.channel.send(`🦶 **${member.user.tag}** was kicked, \`\`no reason was provided\`\``);
     const Embed = new Discord.MessageEmbed()
    .setColor(`BLUE`)
    .setTitle("🦶 Member Kicked")
    .setDescription(`**User** \`\`${member.user.tag}\`\`\n\n**Moderator** \`\`${message.author.tag}\`\`\n\n**Reason** \`\`no reason was provided\`\``);
       utils.LogSend(Embed, client)
            })

            if (reason) return member.kick().then(member => {
                message.channel.send(`🦶 **${member.user.tag}** was kicked for \`\`${reason}\`\``);
     const Embed = new Discord.MessageEmbed()
    .setColor(`BLUE`)
    .setTitle("🦶 Member Kicked")
    .setDescription(`**User** \`\`${member.user.tag}\`\`\n\n**Moderator** \`\`${message.author.tag}\`\`\n\n**Reason** \`\`${reason}\`\``)
       utils.LogSend(Embed, client)
            })
        }
}
// Aliases, name, description and usage
module.exports.help = {
    aliases: [],
    name: 'kick',
    description: 'pong wow!',
    usage: 'PREFIXkick'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Moderation', /* You can make a category help command with this. */
    category_emoji: "⚒️" /* the catagory emoji */
}