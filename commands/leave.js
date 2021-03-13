module.exports.run = async (client, message, args, utils) => {
let config = await utils.yml("./config.yml")
if (config.Music_System !== "true") return message.channel.send("Music system isn't Enabled, Enable it in \`\`Config.yml\`\`")
const queue = message.client.queue.get(message.guild.id);
    
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);
    if (!utils.canModifyQueue(message.member)) return;

  queue.songs = [];
  queue.connection.dispatcher.end();
  queue.textChannel.send(`🛑 I left the voice channel.`).catch(console.error);
}
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['l'],
    name: 'leave',
    description: 'pong wow!',
    usage: 'PREFIXstop'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Music', /* You can make a category help command with this. */
    category_emoji: "🎵" /* the catagory emoji */
}