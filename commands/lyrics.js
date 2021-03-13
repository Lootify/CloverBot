const lyricsFinder = require("lyrics-finder");
const Discord = require("discord.js")

module.exports.run = async (client, message, args, utils) => {
let config = await utils.yml("./config.yml")
if (config.Music_System !== "true") return message.channel.send("Music system isn't Enabled, Enable it in \`\`Config.yml\`\`")

const queue = message.client.queue.get(message.guild.id);
  //  if (!queue) return message.channel.send("There is nothing playing.").catch(console.error);

    let lyrics = null;
    let song = null;
    try {
      if (args.length){ 
      song = args
      }else if(queue){
      song = queue.songs[0].title
      }
      lyrics = await lyricsFinder(song, "");
      if (!lyrics) lyrics = `No lyrics found.`;
    } catch (error) {
      lyrics = `No lyrics found.`;
    }

    let lyricsEmbed = new Discord.MessageEmbed()
      .setTitle("Lyrics")
      .setDescription(`**Showing Result for** \`\`${song}\`\`\n\n${lyrics}`)
      .setColor(config.Music_Embed_Color)
      .setTimestamp();

    if (lyricsEmbed.description.length >= 2048)
      lyricsEmbed.description = `${lyricsEmbed.description.substr(0, 2045)}...`;
    return message.channel.send(lyricsEmbed).catch(console.error);

}
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['ly'],
    name: 'lyrics',
    description: 'pong wow!',
    usage: 'PREFIXlyrics'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Music', /* You can make a category help command with this. */
    category_emoji: "🎵" /* the catagory emoji */
}