/////////////////////////////////////////////////////////////////////////////////////
//                 You are free to edit the code to your liking.                   //
//   Adding commands is easy following the example in the "EXAMPLE-COMMAND" file.  //
//          YOU ARE NOT ALLOWED TO CLAIM THIS AS YOUR OWN, OR SELL THIS            //
//                                 (MIT LICENSED)                                  //
/////////////////////////////////////////////////////////////////////////////////////

const Discord =  require("discord.js"),
                 fs = require("fs"),
                 ms = require("parse-ms");

// get the requiered jsons
const utils = require("./utils/utils.js");

// deploy the actual bot
const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED,
    "GUILD_MEMBERS"
]);

const client = new Discord.Client({ ws: { intents } });
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();

client.queue = new Map();
const invites = {};
const cooldown = [];
// Commands handler
fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./commands/${ f }`);
        props.fileName = f;
        client.commands.set(props.help.name, props);
        props.help.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});
let config;
let lang;
async function setupConfig() {
    config = await utils.yml("./config.yml");
    lang = await utils.yml("./lang.yml");
  }
setupConfig();
client.on("ready", () => {
up();
checkGiveaway();
checkStatuses();
checkMutes()
setInterval(checkGiveaway, 60000);
setInterval(checkStatuses, 60000);
setInterval(checkMutes, 60000);
if (config.Client_Status !== "Null") {
client.user.setPresence({
    status: 'dnd',
    activity: {
        name: `${config.Client_Status}`
    }
})
}
})
// Message
client.on("message", message => {
    try {
if (message.author.bot) return;
// Filter System
if (config.Filter_System === "true") {
let hasPermission = message.member.roles.cache.find(role => role.name.toLowerCase() == config.Filter_Bypass_Role.toLowerCase());
let BypassChannels = config.Filter_Bypass_Channels
let Bypass;
if (BypassChannels) {
BypassChannels.forEach(channel => {
if (message.channel.name.toLowerCase() === channel.toLowerCase()) {
Bypass = true
}})
}
let Words = config.Filter_Words
let Filtered;
if (Words) {
Words.forEach(word => {
if (message.content.toLowerCase().includes(word.toLowerCase())) {
Filtered = true
}})
}
if(!hasPermission & !Bypass && Filtered) {
message.delete()
let msg = lang.Filter_Message
return message.reply(msg).then(msg =>{ msg.delete({ timeout: 1000 })})
}}

// Anti-Spam System
if (config.AntiSpam_System === "true") {
let timeout = config.AntiSpam_Amount;
let daily;
for (var i in cooldown) {
  if (cooldown[i].a == message.author.id) {
    daily = cooldown[i].b 
}}
let BypassChannels = config.AntiSpam_Bypass_Channels
let Bypass;
if (BypassChannels) {
BypassChannels.forEach(channel => {
if (message.channel.name.toLowerCase() === channel.toLowerCase()) {
Bypass = true
}})
}
let hasPermission = message.member.roles.cache.find(role => role.name.toLowerCase() == config.AntiSpam_Bypass_Role.toLowerCase());
if (daily !== null && timeout - (Date.now() - daily) > 0 && !hasPermission && !Bypass) {
            let time = ms(timeout - (Date.now() - daily));
if (config.AntiSpam_Delete_Messages === "true") {
            message.delete();
}

let msg = lang.Spam_Message
msg = msg.replace("{seconds}", time.seconds)
msg = msg.replace("{milliseconds}", time.milliseconds)

return message.reply(msg).then(msg =>{ msg.delete({ timeout: 1000 })})
    }}
for(var i = 0; i < cooldown.length; i++) {
    if(cooldown[i].a == message.author.id) {
        cooldown.splice(i, 1);
      break;
    }
}
cooldown.push({a: message.author.id, b: Date.now()})
// ADVERTISEMENT SYSTEM
if(config.AntiAds_System === "true" ) {
let hasPermission = message.member.roles.cache.find(role => role.name.toLowerCase() === config.AntiSpam_Bypass_Role.toLowerCase());
let BypassChannels = config.AntiAds_Bypass_Channels
let Bypass;
let status;
if (BypassChannels) {
BypassChannels.forEach(channel => {
if (message.channel.name.toLowerCase() === channel.toLowerCase()) {
Bypass = true
}})
}
if(message.content.toLowerCase().startsWith(`${config.Client_Prefix}status`) || message.content.toLowerCase().startsWith(`${config.Client_Prefix}st`)) {
 status = true
}
if (!hasPermission && !Bypass && !status) {
            if (/(https?:\/\/)?([^\s]+)?[^\s]+\.[^\s]+/.exec(message.content)) {
              const whitelist = Object.values(config.AntiAds_Whitelisted_Websites).map(v => v.toLowerCase());
              if (!whitelist.find(w => message.content.toLowerCase().includes(w.toLowerCase()))) {
                message.delete();
                let msg = lang.Ad_Message
                return message.reply(msg).then(msg => { msg.delete({timeout: 1000}) });
              }
            }
}}
            if (message.content.indexOf(config.Client_Prefix) !== 0) return;
    
            const args = message.content.slice(config.Client_Prefix.length).trim().split(/ +/g);
            let command = args.shift().toLowerCase();

            if (client.aliases.has(command)) command = client.commands.get(client.aliases.get(command)).help.name

            if (client.commands.get(command).config.restricted == true) {
                if (message.author.id !== config.Client_Owner_ID) return utils.errorEmbed(message, ':warning: __This command is restricted only to the bot developer.__ ')
            }
    
            if (client.commands.get(command).config.args == true) {
                if (!args[0]) return utils.errorEmbed(message, `Invalid arguments. Use: ${config.Client_Prefix + 'help ' + client.commands.get(command).help.name}`)
            }
    
            let commandFile = require(`./commands/${command}.js`);
          commandFile.run(client, message, args, utils);
    
        } catch (err) {
            if (err.message === `Cannot read property 'config' of undefined`) return;
            if (err.code == "MODULE_NOT_FOUND") return;
            console.error(err);
        }
    });
// Reactions
const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
  };
  client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;
    const { d: data } = event;
    const user = client.users.cache.get(data.user_id);
    const channel = client.channels.cache.get(data.channel_id);
    const message = await channel.messages.fetch(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    if (user.bot) return;
    // GIVEAWAYS
    if (event.t == "MESSAGE_REACTION_ADD") {
      let giveaways = require("./data/giveaways.json");
      let giveaway = giveaways.find(g => g.messageID == message.id);
      if (emojiKey == config.Giveaway_Emoji_Unicode && giveaway && !user.bot) {
        giveaways.find(g => g.messageID == message.id).reactions.push(user.id);
        fs.writeFile("./data/giveaways.json", JSON.stringify(giveaways), function (err) { if (err) console.log(err) });
      }
    }
    if (event.t == "MESSAGE_REACTION_REMOVE") {
      let giveaways = require("./data/giveaways.json");
      let giveaway = giveaways.find(g => g.messageID == message.id);
      if (emojiKey == config.Giveaway_Emoji_Unicode && giveaway && giveaway.reactions.includes(user.id) && !user.bot) {
        giveaways.find(g => g.messageID == message.id).reactions.splice(giveaway.reactions.indexOf(user.id), 1);
        fs.writeFile("./data/giveaways.json", JSON.stringify(giveaways), function (err) { if (err) console.log(err) });
      }
    }
  })
 // JOIN EVENT
client.on("guildMemberAdd", async (member) => {
    console.log(`${member.user.tag} Joined the server.`);
    const config = await utils.yml("./config.yml");

    if (config.Join_Role !== 'Null') {
      let role = member.guild.roles.cache.find(r => r.name.toLowerCase() == config.Join_Role.toLowerCase())
      member.addRole(role.id);
    }

    if (config.Join_System === "true") {

      if (config.Join_DM_Message !== 'Null') {
        let JoinMessageVariable_User = config.Join_DM_Message.replace(/{user}/g, `<@${member.user.id}>`);
        let JoinMessageVariable_Tag = JoinMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
        let DMMessageVariable_Total = JoinMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

        member.send(DMMessageVariable_Total);
      }

      const channel = member.guild.channels.cache.find(r => r.name.toLowerCase() === config.Join_Channel.toLowerCase());

      let JoinMessageVariable_User = config.Join_Message.replace(/{user}/g, `<@${member.user.id}>`);
      let JoinMessageVariable_Tag = JoinMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
      let JoinMessageVariable_Total = JoinMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let HeaderVariable_User = config.Join_Embed_Header.replace(/{user}/g, `<@${member.user.id}>`)
      let HeaderVariable_Tag = HeaderVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let HeaderVariable_Total = HeaderVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let DescriptionVariable_User = config.Join_Embed_Description.replace(/{user}/g, `<@${member.user.id}>`)
      let DescriptionVariable_Tag = DescriptionVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let DescriptionVariable_Total = DescriptionVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let FooterVariable_User = config.Join_Embed_Footer.replace(/{user}/g, `<@${member.user.id}>`)
      let FooterVariable_Tag = FooterVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let FooterVariable_Total = FooterVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      if (config.Join_Message === "embed") {

        let embed = new Discord.MessageEmbed()
          .setColor(config.Join_Embed_Color)
          .setAuthor(HeaderVariable_Total)
          .setDescription(DescriptionVariable_Total)

        if (config.Join_Embed_Timestamp === 'true') embed.setTimestamp();
        if (config.Join_Embed_Footer === 'Null') return channel.send(embed);

        embed.setFooter(FooterVariable_Total)
        return channel.send(embed);
      }

      channel.send(JoinMessageVariable_Total);
    }
  });

  // LEAVE EVENT
  client.on("guildMemberRemove", async (member) => {
    console.log(`${member.user.tag} left the server.`);
    const config = await utils.yml("./config.yml");

    if (config.Leave_System === "true") {

      const channel = member.guild.channels.cache.find(r => r.name.toLowerCase() === config.Leave_Channel.toLowerCase());

      let LeaveMessageVariable_User = config.Leave_Message.replace(/{user}/g, `<@${member.user.id}>`);
      let LeaveMessageVariable_Tag = LeaveMessageVariable_User.replace(/{tag}/g, `${member.user.tag}`);
      let LeaveMessageVariable_Total = LeaveMessageVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let HeaderVariable_User = config.Leave_Embed_Header.replace(/{user}/g, `<@${member.user.id}>`)
      let HeaderVariable_Tag = HeaderVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let HeaderVariable_Total = HeaderVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let DescriptionVariable_User = config.Leave_Embed_Description.replace(/{user}/g, `<@${member.user.id}>`)
      let DescriptionVariable_Tag = DescriptionVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let DescriptionVariable_Total = DescriptionVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      let FooterVariable_User = config.Leave_Embed_Footer.replace(/{user}/g, `<@${member.user.id}>`)
      let FooterVariable_Tag = FooterVariable_User.replace(/{tag}/g, `${member.user.tag}`)
      let FooterVariable_Total = FooterVariable_Tag.replace(/{total}/g, `${member.guild.memberCount}`);

      if (config.Leave_Message === "embed") {

        let embed = new Discord.MessageEmbed()
          .setColor(config.Leave_Embed_Color)
          .setAuthor(HeaderVariable_Total)
          .setDescription(DescriptionVariable_Total)

        if (config.Leave_Embed_Timestamp === 'true') embed.setTimestamp();
        if (config.Leave_Embed_Footer === 'Null') return channel.send(embed);

        embed.setFooter(FooterVariable_Total)
        return channel.send(embed);
      }

      channel.send(LeaveMessageVariable_Total);
    }

  });
function up() {
    console.log(`#-------------------------------#`)
    console.log(`          CloverBot v${config.CBOT_VERSION}`)
    console.log(`Need Help? Join our Support Server`)
    console.log( `https://discord.gg/bBCNyspAnf`)
    console.log(`#-------------------------------#`);
}

function checkMutes() {
    let mutes = require("./data/mutes.json");
    mutes.forEach(async mute => {
      if (mute.time <= Date.now() && mute.time !== 0) {
        //giveaway has ended
        let guild = mute.guild
        let user = client.guilds.cache.get(guild).members.cache.get(mute.user);
        let muterole = mute.muterole
        if (user) {
        await user.roles.remove(muterole);
        }
        mutes.find(m => m == mute).time = 0;
        fs.writeFile("./data/mutes.json", JSON.stringify(mutes), function (err) { if (err) console.log(err) })
      }
    })
  }

function checkGiveaway() {
    let giveaways = require("./data/giveaways.json");
    giveaways.forEach(giveaway => {
      if (giveaway.end <= Date.now() && !giveaway.ended) {
        //giveaway has ended
        giveaways.find(g => g == giveaway).ended = true;
        fs.writeFile('./data/giveaways.json', JSON.stringify(giveaways), function (err) { if (err) console.log(err) })
        let guild = client.guilds.cache.get(giveaway.guild);
        let channel = guild.channels.cache.get(giveaway.channel);
        if (guild && channel) {
          channel.messages.fetch({ around: giveaway.messageID, limit: 1 }).then(msg => {
            let winners = [];
            let reactions = [...giveaway.reactions];
            for (let i = 0; i < giveaway.winners; i++) {
              let user = reactions[~~(Math.random() * reactions.length)];
              winners.push(user);
              reactions.splice(reactions.indexOf(user), 1);
            }
            if (giveaway.reactions.length < 1) return channel.send("No one entered the giveaway.");
            channel.send(`🎉 Congratulations to ${winners.filter(u => u).map(u => "<@" + u + ">").join(",")} for winning \`\`${giveaway.name}\`\``);
          })
        }
      }
    })
  }
async function CheckKey(key) {
let oo = await utils.check(key)
if(!oo) {
console.log(`Bot Stopped, Please Input a correct Key in "Client_Key" in "config.yml" file.`)
process.exit()
client.destroy();
}
}
  // ADVERTISEMENT CHECK
  function checkStatuses() {
    if (config.AntiAds_System && config.AntiAds_Status_System.toLowerCase() == "true") {
      const whitelist = Object.values(config.AntiAds_Whitelisted_Websites).map(w => w.toLowerCase());
      client.guilds.cache.forEach(guild => {
        const channel = guild.channels.cache.find(c => c.name.toLowerCase() == config.AntiAds_Channel.toLowerCase());
        const bypass = guild.roles.cache.find(r => r.name.toLowerCase() == config.AntiAds_Bypass_Role.toLowerCase());
        if (!channel) return;
        guild.members.fetch().then(members => {
          members.array().forEach(member => {
            const status = member.user.presence.game;
            if (status) {
              if (member.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= bypass.calculatedPosition) return;
              const check = [status.name, status.url, status.details, status.state, status.assets ? status.assets.largeText : '', status.assets ? status.assets.smallText : ''];
              check.forEach(c => {
                if (/(https?:\/\/|www\.|https?:\/\/www\.).+/.exec(c)) {
                  if (!whitelist.find(w => c.toLowerCase().includes(w.toLowerCase()))) {
                    const embed = new Discord.MessageEmbed()
                      .setColor(config.AntiAds_Embed_Color)
                      .setTitle("**ADVERTISEMENT DETECTED**")
                      .addField("User", member)
                      .addField("User ID", member.id)
                      .addField("Detected", c);
                    channel.send(embed);
                  }
                }
              })
            }
          })
        })
      })
    }
  }
client.on("messageDelete", message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  if (!message.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!message.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) return;

  let messageDelete = new Discord.MessageEmbed()
    .setTitle(":wastebasket: **Message Deleted**")
    .setColor("RED")
    .setThumbnail(message.author.avatarURL)
    .setDescription(
      `**MESSAGE** \`\`DELETED\`\` In ${message.channel}\n\n**Channel:** \`\`${message.channel.name}\`\` (ID: ${message.channel.id})\n**Message ID:** ${message.id}\n**Sent By:** <@${message.author.id}> (ID: ${message.author.id})\n**Message:**\n\`\`\`${message}\`\`\``
    )
    .setTimestamp()
    .setFooter(message.guild.name, message.guild.iconURL);

  utils.LogSend(messageDelete, client, config);
});
client.on("messageUpdate", (oldMessage, newMessage) => {
  if (oldMessage.author.bot) return;
  if (!oldMessage.channel.type === "dm") return;
  if (!oldMessage.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!oldMessage.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) return;

  if (oldMessage.content.startsWith("https://")) return;

  let messageUpdate = new Discord.MessageEmbed()
    .setTitle(":wrench: **Message Edited**")
    .setThumbnail(oldMessage.author.avatarURL)
    .setColor("BLUE")
    .setDescription(
      `**MESSAGE** \`\`EDITED\`\` In ${oldMessage.channel}\n\n**Channel:** \`\`${oldMessage.channel.name}\`\` (ID: ${oldMessage.channel.id})\n**Message ID:** ${oldMessage.id}\n**Sent By:** <@${oldMessage.author.id}> (ID: ${oldMessage.author.id})\n\n**Old Message:**\`\`\`${oldMessage}\`\`\`\n**New Message:**\`\`\`${newMessage}\`\`\``
    )
    .setTimestamp()
    .setFooter(oldMessage.guild.name, oldMessage.guild.iconURL);

  utils.LogSend(messageUpdate, client, config);
});

client.on("roleCreate", role => {
  if (!role.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!role.guild.member(client.user).hasPermission("VIEW_AUDIT_LOG")) return;

  role.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    let roleCreate = new Discord.MessageEmbed()
      .setTitle(":white_check_mark: **Role Created**")
      .setThumbnail(userAvatar)
      .setDescription(
        `**ROLE** \`\`CREATED\`\`\n\n**Role Name:** \`\`${role.name}\`\` (ID: ${role.id})\n**By:** <@${userID}> (ID: ${userID})`
      )
      .setColor("GREEN")
      .setTimestamp()
      .setFooter(role.guild.name, role.guild.iconURL);

    utils.LogSend(roleCreate, client, config);
  });
});
client.on("roleDelete", role => {
  if (!role.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!role.guild.member(client.user).hasPermission("VIEW_AUDIT_LOG")) return;

  role.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    let roleDelete = new Discord.MessageEmbed()
      .setTitle(":wastebasket: **Role Deleted**")
      .setThumbnail(userAvatar)
      .setDescription(
        `Role \`\`DELETED\`\`\n\n**Role Name:** \`\`${role.name}\`\` (ID: ${role.id})\n**By:** <@${userID}> (ID: ${userID})`
      )
      .setColor("RED")
      .setTimestamp()
      .setFooter(role.guild.name, role.guild.iconURL);

    utils.LogSend(roleDelete, client, config);
  });
});
client.on("roleUpdate", (oldRole, newRole) => {
  if (!oldRole.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!oldRole.guild.member(client.user).hasPermission("VIEW_AUDIT_LOG"))return;

  oldRole.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    if (oldRole.name !== newRole.name) {
      let roleUpdateName = new Discord.MessageEmbed()
        .setTitle(":wrench: **Role Edited**")
        .setThumbnail(userAvatar)
        .setColor("BLUE")
        .setDescription(
          `**Role Name** \`\`EDITED\`\`\n\n**Old Name:** \`\`${oldRole.name}\`\`\n**New Name:** \`\`${newRole.name}\`\`\n**Role ID:** ${oldRole.id}\n**By:** <@${userID}> (ID: ${userID})`
        )
        .setTimestamp()
        .setFooter(oldRole.guild.name, oldRole.guild.iconURL);
    
      utils.LogSend(roleUpdateName, client, config);
    }
    if (oldRole.hexColor !== newRole.hexColor) {
      if (oldRole.hexColor === "#000000") {
        var oldColor = "`Default`";
      } else {
        var oldColor = oldRole.hexColor;
      }
      if (newRole.hexColor === "#000000") {
        var newColor = "`Default`";
      } else {
        var newColor = newRole.hexColor;
      }
      let roleUpdateColor = new Discord.MessageEmbed()
        .setTitle(":wrench: **Role Edited**")
        .setThumbnail(userAvatar)
        .setColor("BLUE")
        .setDescription(
          `**Role Color** \`\`EDITED\`\` for **${oldRole.name}**\n\n**Old Color:** ${oldColor}\n**New Color:** ${newColor}\n**Role ID:** ${oldRole.id}\n**By:** <@${userID}> (ID: ${userID})`
        )
        .setTimestamp()
        .setFooter(oldRole.guild.name, oldRole.guild.iconURL);

      utils.LogSend(roleUpdateColor, client, config);
    }
    })
  });

client.on("channelCreate", channel => {
  if (!channel.guild) return;
  if (!channel.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!channel.guild.member(client.user).hasPermission("VIEW_AUDIT_LOG")) return;

  if (channel.type === "text") {
    var roomType = "Text";
  } else if (channel.type === "voice") {
    var roomType = "Voice";
  } else if (channel.type === "category") {
    var roomType = "Category";
  }

  channel.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    let channelCreate = new Discord.MessageEmbed()
      .setTitle(":white_check_mark: **Channel Created**")
      .setThumbnail(userAvatar)
      .setDescription(
        `**${roomType} Channel** \`\`CREATED\`\` \n\n**Channel Name:** \`\`${channel.name}\`\` (ID: ${channel.id})\n**By:** <@${userID}> (ID: ${userID})`
      )
      .setColor("GREEN")
      .setTimestamp()
      .setFooter(channel.guild.name, channel.guild.iconURL);

    utils.LogSend(channelCreate, client, config);
  });
});
client.on("channelDelete", channel => {
  if (!channel.guild) return;
  if (!channel.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!channel.guild.member(client.user).hasPermission("VIEW_AUDIT_LOG")) return;

  if (channel.type === "text") {
    var roomType = "Text";
  } else if (channel.type === "voice") {
    var roomType = "Voice";
  } else if (channel.type === "category") {
    var roomType = "Category";
  }

  channel.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    let channelDelete = new Discord.MessageEmbed()
      .setTitle(":wastebasket: **Channel Deleted**")
      .setThumbnail(userAvatar)
      .setDescription(
        `**${roomType} Channel** \`\`DELETED\`\`\n\n**Channel Name:** \`\`${channel.name}\`\` (ID: ${channel.id})\n**By:** <@${userID}> (ID: ${userID})`
      )
      .setColor("RED")
      .setTimestamp()
      .setFooter(channel.guild.name, channel.guild.iconURL);

    utils.LogSend(channelDelete, client, config);
  });
});
client.on("channelUpdate", (oldChannel, newChannel) => {
  if (!oldChannel.guild) return;

  if (oldChannel.type === "text") {
    var channelType = "Text";
  } else if (oldChannel.type === "voice") {
    var channelType = "Voice";
  } else if (oldChannel.type === "category") {
    var channelType = "Category";
  }

  oldChannel.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    if (oldChannel.name !== newChannel.name) {
      let newName = new Discord.MessageEmbed()
        .setTitle(":wrench: **Channel Edited**")
        .setThumbnail(userAvatar)
        .setColor("BLUE")
        .setDescription(
          `**${channelType} Channel Name** \`\`EDITED\`\`\n\n**Old Name:** \`\`${oldChannel.name}\`\`\n**New Name:** \`\`${newChannel.name}\`\`\n**Channel ID:** ${oldChannel.id}\n**By:** <@${userID}> (ID: ${userID})`
        )
        .setTimestamp()
        .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL);

      utils.LogSend(newName, client, config);
    }
    if (oldChannel.topic !== newChannel.topic) {
      let newTopic = new Discord.MessageEmbed()
        .setTitle(":wrench: **Channel Edited**")
        .setThumbnail(userAvatar)
        .setColor("BLUE")
        .setDescription(
          `**${channelType} Channel Topic** \`\`Edited\`\`\n\n**Old Topic:**\n\`\`\`${oldChannel.topic ||
            "NULL"}\`\`\`\n**New Topic:**\n\`\`\`${newChannel.topic ||
            "NULL"}\`\`\`\n**Channel:** ${oldChannel} (ID: ${
            oldChannel.id
          })\n**By:** <@${userID}> (ID: ${userID})`
        )
        .setTimestamp()
        .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL);

      utils.LogSend(newTopic, client, config);
    }
  });
});

client.on("guildBanAdd", (guild, user) => {
  if (!guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!guild.member(client.user).hasPermission("VIEW_AUDIT_LOG")) return;

  guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    if (userID === client.user.id) return;

    let banInfo = new Discord.MessageEmbed()
      .setTitle(":airplane: **User Banned**")
      .setThumbnail(userAvatar)
      .setColor("DARK_RED")
      .setDescription(
        `**${user.username}** \`\`BANNED\`\` From the server!\n\n**User:** <@${user.id}> (ID: ${user.id})\n**By:** <@${userID}> (ID: ${userID})`
      )
      .setTimestamp()
      .setFooter(guild.name, guild.iconURL);

    utils.LogSend(banInfo, client, config);
  });
});
client.on("guildBanRemove", (guild, user) => {
  if (!guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!guild.member(client.user).hasPermission("VIEW_AUDIT_LOG")) return;

  guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;

    if (userID === client.user.id) return;

    let unBanInfo = new Discord.MessageEmbed()
      .setTitle(":unlock: **User Banned**")
      .setThumbnail(userAvatar)
      .setColor("GREEN")
      .setDescription(
        `**${user.username}** \`\`UNBANNED\`\` From the server\n\n**User:** <@${user.id}> (ID: ${user.id})\n**By:** <@${userID}> (ID: ${userID})`
      )
      .setTimestamp()
      .setFooter(guild.name, guild.iconURL);

    utils.LogSend(unBanInfo, client, config);
  });
});

client.on("guildMemberUpdate", (oldMember, newMember) => {
  if (!oldMember.guild) return;

  oldMember.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userAvatar = logs.entries.first().executor.avatarURL;
    var userTag = logs.entries.first().executor.tag;

    if (oldMember.nickname !== newMember.nickname) {
      if (oldMember.nickname === null) {
        var oldNM = "`Unknown`";
      } else {
        var oldNM = oldMember.nickname;
      }
      if (newMember.nickname === null) {
        var newNM = "`Unknown`";
      } else {
        var newNM = newMember.nickname;
      }

      let updateNickname = new Discord.MessageEmbed()
        .setTitle(":spy: **Nickname Changed**")
        .setThumbnail(userAvatar)
        .setColor("BLUE")
        .setDescription(
          `Member Nickname \`\`CHANGED\`\`\n\n**User:** ${oldMember} (ID: ${oldMember.id})\n**Old Nickname:** ${oldNM}\n**New Nickname:** ${newNM}\n**By:** <@${userID}> (ID: ${userID})`
        )
        .setTimestamp()
        .setFooter(oldMember.guild.name, oldMember.guild.iconURL);

      utils.LogSend(updateNickname);
    }
    if (oldMember.roles.size < newMember.roles.size) {
      let role = newMember.roles
        .filter(r => !oldMember.roles.has(r.id))
        .first();
      let roleAdded = new Discord.MessageEmbed()
        .setTitle(":white_check_mark: **Role Added**")
        .setThumbnail(oldMember.guild.iconURL)
        .setColor("GREEN")
        .setDescription(
          `Role \`\`ADDED\`\` to **${oldMember.user.username}**\n\n**User:** <@${oldMember.id}> (ID: ${oldMember.user.id})\n**Role:** \`\`${role.name}\`\` (ID: ${role.id})\n**By:** <@${userID}> (ID: ${userID})`
        )
        .setTimestamp()
        .setFooter(userTag, userAvatar);

      utils.LogSend(roleAdded, client, config);
    }
    if (oldMember.roles.size > newMember.roles.size) {
      let role = oldMember.roles
        .filter(r => !newMember.roles.has(r.id))
        .first();
      let roleRemoved = new Discord.MessageEmbed()
        .setTitle(":negative_squared_cross_mark: **Role Removed**")
        .setThumbnail(oldMember.guild.iconURL)
        .setColor("RED")
        .setDescription(
          `Role \`\`REMOVED\`\` from **${oldMember.user.username}**\n\n**User:** <@${oldMember.user.id}> (ID: ${oldMember.id})\n**Role:** \`\`${role.name}\`\` (ID: ${role.id})\n**By:** <@${userID}> (ID: ${userID})`
        )
        .setTimestamp()
        .setFooter(userTag, userAvatar);

      utils.LogSend(roleRemoved, client, config);
    }
  });
  if (oldMember.guild.owner.id !== newMember.guild.owner.id) {
    
    let newOwner = new Discord.MessageEmbed()
      .setTitle("👑 **Ownership Updated**")
      .setThumbnail(oldMember.guild.iconURL)
      .setColor("GREEN")
      .setDescription(
        `OwnerShip \`\`TRANSFERED\`\`\n\n**Old Owner:** <@${oldMember.user.id}> (ID: ${oldMember.user.id})\n**New Owner:** <@${newMember.user.id}> (ID: ${newMember.user.id})`
      )
      .setTimestamp()
      .setFooter(oldMember.guild.name, oldMember.guild.iconURL);

    utils.LogSend(newOwner, client, config);
  }
});

client.on("voiceStateUpdate", (voiceOld, voiceNew) => {
  if (!voiceOld.guild.member(client.user).hasPermission("EMBED_LINKS")) return;
  if (!voiceOld.guild.member(client.user).hasPermission("VIEW_AUDIT_LOG")) return;

  voiceOld.guild.fetchAuditLogs().then(logs => {
    var userID = logs.entries.first().executor.id;
    var userTag = logs.entries.first().executor.tag;
    var userAvatar = logs.entries.first().executor.avatarURL;

    if (voiceOld.serverMute === false && voiceNew.serverMute === true) {
      let serverMutev = new Discord.MessageEmbed()
        .setTitle("🎤 **Voice Muted**")
        .setThumbnail(
          "https://images-ext-1.discordapp.net/external/pWQaw076OHwVIFZyeFoLXvweo0T_fDz6U5C9RBlw_fQ/https/cdn.pg.sa/UosmjqDNgS.png"
        )
        .setColor("RED")
        .setDescription(
          `**User:** ${voiceOld} (ID: ${voiceOld.id})\n**By:** <@${userID}> (ID: ${userID})\n**Channel:** \`\`${voiceOld.voiceChannel.name}\`\` (ID: ${voiceOld.voiceChannel.id})`
        )
        .setTimestamp()
        .setFooter(userTag, userAvatar);

      utils.LogSend(serverMutev, client, config);
    }
    if (voiceOld.serverMute === true && voiceNew.serverMute === false) {
      let serverUnmutev = new Discord.MessageEmbed()
        .setTitle("🎤 **Voice UnMuted**")
        .setThumbnail(
          "https://images-ext-1.discordapp.net/external/u2JNOTOc1IVJGEb1uCKRdQHXIj5-r8aHa3tSap6SjqM/https/cdn.pg.sa/Iy4t8H4T7n.png"
        )
        .setColor("GREEN")
        .setDescription(
          `**User:** ${voiceOld} (ID: ${voiceOld.id})\n**By:** <@${userID}> (ID: ${userID})\n**Channel:** \`\`${voiceOld.voiceChannel.name}\`\` (ID: ${voiceOld.voiceChannel.id})`
        )
        .setTimestamp()
        .setFooter(userTag, userAvatar);

      utils.LogSend(serverUnmutev, client, config);
    }
    if (voiceOld.serverDeaf === false && voiceNew.serverDeaf === true) {
  
      let serverDeafv = new Discord.MessageEmbed()
        .setTitle("🔇 **Voice Deafened**")
        .setThumbnail(
          "https://images-ext-1.discordapp.net/external/7ENt2ldbD-3L3wRoDBhKHb9FfImkjFxYR6DbLYRjhjA/https/cdn.pg.sa/auWd5b95AV.png"
        )
        .setColor("RED")
        .setDescription(
          `**User:** ${voiceOld} (ID: ${voiceOld.id})\n**By:** <@${userID}> (ID: ${userID})\n**Channel:** \`\`${voiceOld.voiceChannel.name}\`\` (ID: ${voiceOld.voiceChannel.id})`
        )
        .setTimestamp()
        .setFooter(userTag, userAvatar);

      utils.LogSend(serverDeafv, client, config);
    }
    if (voiceOld.serverDeaf === true && voiceNew.serverDeaf === false) {
      let serverUndeafv = new Discord.MessageEmbed()
        .setTitle("🔇 **Voice UnDeafened**")
        .setThumbnail(
          "https://images-ext-2.discordapp.net/external/s_abcfAlNdxl3uYVXnA2evSKBTpU6Ou3oimkejx3fiQ/https/cdn.pg.sa/i7fC8qnbRF.png"
        )
        .setColor("GREEN")
        .setDescription(
          `**User:** ${voiceOld} (ID: ${voiceOld.id})\n**By:** <@${userID}> (ID: ${userID})\n**Channel:** \`\`${voiceOld.voiceChannel.name}\`\` (ID: ${voiceOld.voiceChannel.id})`
        )
        .setTimestamp()
        .setFooter(userTag, userAvatar);

      utils.LogSend(serverUndeafv, client, config);
    }
  });

  if (
    voiceOld.voiceChannelID !== voiceNew.voiceChannelID &&
    voiceNew.voiceChannel &&
    voiceOld.voiceChannel != null
  ) {
    let voiceLeave = new Discord.MessageEmbed()
      .setTitle(":repeat: **Voice Channel Changed*")
      .setColor("GREEN")
      .setThumbnail(voiceOld.user.avatarURL)
      .setDescription(
        ` Voice Channel \`\`CHANGED\`\`\n\n**From:** \`\`${voiceOld.voiceChannel.name}\`\` (ID: ${voiceOld.voiceChannelID})\n**To:** \`\`${voiceNew.voiceChannel.name}\`\` (ID: ${voiceNew.voiceChannelID})\n**User:** ${voiceOld} (ID: ${voiceOld.id})`
      )
      .setTimestamp()
      .setFooter(voiceOld.user.tag, voiceOld.user.avatarURL);

    utils.LogSend(voiceLeave, client, config);
  }
});
client.login(process.env.Client_Token);
