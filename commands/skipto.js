module.exports.run = async (client, message, args, utils) => {
let config = await utils.yml("./config.yml")
if (config.Music_System !== "true") return message.channel.send("Music system isn't Enabled, Enable it in \`\`Config.yml\`\`")
if (!args.length)
      return message
        .reply(`Usage: ${message.client.prefix}${module.exports.name} <Queue Number>`)
        .catch(console.error);

    if (isNaN(args[0]))
      return message
        .reply(`Usage: ${message.client.prefix}${module.exports.name} <Queue Number>`)
        .catch(console.error);

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send("There is no queue.").catch(console.error);
    if (!utils.canModifyQueue(message.member)) return;

    if (args[0] > queue.songs.length)
      return message.reply(`The queue is only ${queue.songs.length} songs long!`).catch(console.error);

    queue.playing = true;
    if (queue.loop) {
      for (let i = 0; i < args[0] - 2; i++) {
        queue.songs.push(queue.songs.shift());
      }
    } else {
      queue.songs = queue.songs.slice(args[0] - 2);
    }
    queue.connection.dispatcher.end();
    queue.textChannel.send(`${message.author} ⏭ skipped ${args[0] - 1} songs`).catch(console.error);
}
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['sto'],
    name: 'skipto',
    description: 'pong wow!',
    usage: 'PREFIXskipto'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Music', /* You can make a category help command with this. */
    category_emoji: "🎵" /* the catagory emoji */
}