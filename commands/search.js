const { MessageEmbed } = require("discord.js");
var play = require("./play.js");
const YouTubeAPI = require("simple-youtube-api");

module.exports.run = async (client, message, args, utils) => {
let config = await utils.yml("./config.yml")
if (config.Music_System !== "true") return message.channel.send("Music system isn't Enabled, Enable it in \`\`Config.yml\`\`")
const YOUTUBE_API_KEY = config.Music_Youtube_Key

const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
    if (!args.length)
      return message.reply(`Usage: ${message.client.prefix}${module.exports.name} <Video Name>`).catch(console.error);
    if (message.channel.activeCollector)
      return message.reply("A message collector is already active in this channel.");
    if (!message.member.voice.channel)
      return message.reply("You need to join a voice channel first!").catch(console.error);

    const search = args.join(" ");

    let resultsEmbed = new MessageEmbed()
      .setTitle(`**Reply with the song number you want to play**`)
      .setDescription(`Results for: ${search}`)
      .setColor(config.Music_Embed_Color);

    try {
      const results = await youtube.searchVideos(search, 10);
      results.map((video, index) => resultsEmbed.addField(video.shortURL, `${index + 1}. ${video.title}`));

      var resultsMessage = await message.channel.send(resultsEmbed);

      function filter(msg) {
        const pattern = /(^[1-9][0-9]{0,1}$)/g;
        return pattern.test(msg.content) && parseInt(msg.content.match(pattern)[0]) <= 10;
      }

      message.channel.activeCollector = true;
      const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
      const choice = resultsEmbed.fields[parseInt(response.first()) - 1].name;

      message.channel.activeCollector = false;
      play.run(client, message, [choice], utils)
 //     message.client.commands.get("play").execute(message, [choice]); (client, message, args, utils)
      resultsMessage.delete().catch(console.error);
    } catch (error) {
      console.error(error);
      message.channel.activeCollector = false;
    }
  }
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['sh'],
    name: 'search',
    description: 'pong wow!',
    usage: 'PREFIXresume'
}

// Configuration
module.exports.config = {
    args: false, /* The command requires arguments? Could be false or true. */
    restricted: false, /* Can only owner use the command? Could be false or true. */
    category: 'Music', /* You can make a category help command with this. */
    category_emoji: "🎵" /* the catagory emoji */
}
