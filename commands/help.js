const Discord = require("discord.js");
const fs = require("fs");
module.exports.run = async (client, message, args, utils) => {
  let config = await utils.yml("./config.yml");
  //console.log(client.commands)
  let music;
  let giveaways;
  if (config.Music_System === "true") music = true;

  if (args.length) {
    if (fs.existsSync("./commands/" + args[0] + ".js")) {
      var command = require("./" + args[0] + ".js");
      let aliases = command.help.aliases;
      let emoji = command.config.category_emoji;
      if (!emoji) emoji = "";
      if (aliases.length < 1) {
        aliases = "";
      } else {
        aliases = `(${command.help.aliases}) `;
      }
      var embed = new Discord.MessageEmbed()
        .setTitle(emoji + " " + command.help.name + aliases)
        .setDescription(command.help.description);
      embed.addField("Category", command.config.category, true);
      let usage = command.help.usage.replace("PREFIX", config.Client_Prefix);
      embed.addField("Usage", usage, true);
      //     message.channel.send("Arguments: <> = needed argument, [] = optional argument")
      message.channel.send(embed);
    } else {
      let list = {};
      let cat = [];
      let msg = "";
      fs.readdirSync("./commands").forEach(file => {
        var command = require("./" + file);
        if (!list[command.config.category]) {
          list[command.config.category] = [];
          cat.push(command.config.category);
        }
      });
      cat.forEach(category => {
        if (category.toLowerCase() === args[0].toLowerCase()) {
          client.commands.forEach(cmd => {
            if (cmd.config.category === category) {
              let aliases = cmd.help.aliases;
              if (aliases.length < 1) {
                aliases = "";
              } else {
                aliases = `(${cmd.help.aliases}) `;
              }
              msg += `\n**${config.Client_Prefix}${cmd.help.name}** ${aliases}- ${cmd.help.description}`;
            }
          });
        }
      });
      if (msg === "") {
        message.channel.send("Invalid command");
      } else {
        message.channel.send(msg);
      }
    }
  } else {
    let list = {};
    let cat = [];
    fs.readdirSync("./commands").forEach(file => {
      let command = require("./" + file);
      if (!list[command.config.category]) {
        list[command.config.category] = [];
        cat.push(command.config.category);
      }
    });
    let embed = new Discord.MessageEmbed()
      .setTitle("Main Help")
      .setFooter("Arguments: <> = needed argument, [] = optional argument")
    let lt = {};
    let em = {}
    let emo = []
    cat.forEach(category => {
      client.commands.forEach(cmd => {
        if (cmd.config.category === category) {
          if (!lt[cmd.config.category]) {
            lt[cmd.config.category] = [];
            let emoji = cmd.config.category_emoji;
            if (!emoji) emoji = "";
            emo.push(emoji);
            em[emoji] = []
            embed.addField(
              "**" + emoji + category + "**",
              `Use \`\`${config.Client_Prefix}help ${category}\`\``,
              true
            );
          }
        }
      });
    });
    console.log(cat);
    console.log(emo)
    /* for (category in list) {
                var commands = []
                for (cmd in list[category]) {
                    commands.push(list[category][cmd])
                }
                embed.addField("**" + category.charAt(0).toUpperCase() + category.slice(1) + "**", commands)
            }*/
let msg = await message.channel.send(embed); 

emo.forEach(async emoji => {  
     await msg.react(`${emoji}`);
})

const filter = (reaction, user) => {
	return user.id === message.author.id;
};
var collector = msg.createReactionCollector(filter, {
      time: 600000
});
collector.on("collect", (reaction, user) => {
      const member = message.guild.member(user);
      let msga = ""
      if(member.user.bot) return;
   //   if (!lt[reaction.emoji.name]) return;
      reaction.users.remove(user.id);
if(reaction.emoji.name === "◀️") {
let embedo = new Discord.MessageEmbed()
.setTitle("Main Help")
.setFooter("Arguments: <> = needed argument, [] = optional argument")
let to = []
cat.forEach(category => {
    client.commands.forEach(cmd => {
        if (cmd.config.category === category) {
          if (!to[cmd.config.category]) {
            to[cmd.config.category] = [];
            let emoji = cmd.config.category_emoji;
            if (!emoji) emoji = "";
            emo.push(emoji);
            em[emoji] = []
            embedo.addField(
              "**" + emoji + category + "**",
              `Use \`\`${config.Client_Prefix}help ${category}\`\``,
              true
            );
          }
        }
      });
    });
  reaction.remove();
  return msg.edit(embedo);
 }else {
client.commands.forEach(cmd => {
              if (cmd.config.category_emoji === reaction.emoji.name) {
              let aliases = cmd.help.aliases;
              if (aliases.length < 1) {
                aliases = "";
              } else {
                aliases = `(${cmd.help.aliases}) `;
              }
              msga += `\n**${config.Client_Prefix}${cmd.help.name}** ${aliases}- ${cmd.help.description}`;
            }
                })
}
if(msga) {
let embed = new Discord.MessageEmbed()
.setFooter("Arguments: <> = needed argument, [] = optional argument")
.setDescription(msga)
msg.edit(embed)
msg.react("◀️");
}
    });
  }
};
// Aliases, name, description and usage
module.exports.help = {
  aliases: ["h"],
  name: "help",
  description: "pong wow!",
  usage: "PREFIXhelp [command/category]"
};

// Configuration
module.exports.config = {
  args: false /* The command requires arguments? Could be false or true. */,
  restricted: false /* Can only owner use the command? Could be false or true. */,
  category: "Utils" /* You can make a category help command with this. */,
  category_emoji: "📎" /* the catagory emoji */
};
