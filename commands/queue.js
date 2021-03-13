const Discord = require("discord.js")

module.exports.run = async (client, message, args, utils) => {
let config = await utils.yml("./config.yml")
if (config.Music_System !== "true") return message.channel.send("Music system isn't Enabled, Enable it in \`\`Config.yml\`\`")
 const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.reply("There is nothing playing.").catch(console.error);

    const description = queue.songs.map((song, index) => `${index + 1}. ${Discord.escapeMarkdown(song.title)}`);

    let queueEmbed = new Discord.MessageEmbed()
      .setTitle("Music Queue")
      .setDescription(description)
      .setColor(config.Music_Embed_Color);

    const splitDescription = Discord.splitMessage(description, {
      maxLength: 2048,
      char: "\n",
      prepend: "",
      append: ""
    });

    splitDescription.forEach(async (m) => {
      queueEmbed.setDescription(m);
      message.channel.send(queueEmbed);
})
}
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['q'],
    name: 'queue',
    description: 'pong wow!',
    usage: 'PREFIXqueue'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Music', /* You can make a category help command with this. */
    category_emoji: "🎵" /* the catagory emoji */
}