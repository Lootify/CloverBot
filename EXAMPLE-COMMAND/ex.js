module.exports.run = async (client, message, args, utils) => {

message.channel.send("Hi")

}
// Aliases, name, description and usage
module.exports.help = {
    aliases: ['eo', 'es', 'ep'],
    name: 'ex',
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