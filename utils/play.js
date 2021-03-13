const ytdlDiscord = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader");

module.exports = {
  async play(song, message, utils, client) {
let config = await utils.yml("./config.yml")
const SOUNDCLOUD_CLIENT_ID = config.Music_Soundcloud_Id
const PRUNING = config.Music_Pruning
    const queue = message.client.queue.get(message.guild.id);

    if (!song) {
      queue.channel.leave();
      message.client.queue.delete(message.guild.id);
      return queue.textChannel.send("🚫 Music queue ended.").catch(console.error);
    }

    let stream = null;
    let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

    try {
      if (song.url.includes("youtube.com")) {
        stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
      } else if (song.url.includes("soundcloud.com")) {
        try {
          stream = await scdl.downloadFormat(
            song.url,
            scdl.FORMATS.OPUS,
            SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
          );
        } catch (error) {
          stream = await scdl.downloadFormat(
            song.url,
            scdl.FORMATS.MP3,
            SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
          );
          streamType = "unknown";
        }
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      }

      console.error(error);
      return message.channel.send(`Error: ${error.message ? error.message : error}`);
    }

    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (queue.loop) {
          // if loop is on, push the song back at the end of the queue
          // so it can repeat endlessly
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message, utils);
        } else {
          // Recursively play the next song
          queue.songs.shift();
          module.exports.play(queue.songs[0], message, utils);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message, utils);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);
    let time = new Date(song.duration * 1000).toISOString().substr(11, 8)
    time = time.replace('00:', '')

    try {
      let photo;
      if(config.Music_Image.toLowerCase() === "true") {
      if(config.Music_Image_Design === "1") {
      photo = await image(message, song) 
      }else if(config.Music_Image_Design === "2") {
      photo = await image2(message, song)
      }
      }
     message.channel.startTyping();
     if(!photo) {
     var playingMessage = await queue.textChannel.send(`🎶 Started playing: **${song.title}** *(*\`${time}\`*)*`)
    message.channel.stopTyping();
      }else {
     var playingMessage = await queue.textChannel.send(`🎶 Started playing: **${song.title}** *(*\`${time}\`*)*`, { files: [{
      attachment: photo,
      name: `song.jpg`
}]})
message.channel.stopTyping();
};
      await playingMessage.react("⏭");
      await playingMessage.react("⏯");
      await playingMessage.react("🔇");
      await playingMessage.react("🔉");
      await playingMessage.react("🔊");
      await playingMessage.react("🔁");
      await playingMessage.react("⏹");
 if(config.Music_Status !== "Null") {
 let songy = await config.Music_Status.toLowerCase().replace("{song}" ,song.title)
 client.user.setPresence({
    status: 'dnd',
    activity: {
        name: `${songy}`,
        type: 'LISTENING'

    }})
}
    } catch (error) {
      console.error(error);
    }
    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
      if (!queue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case "⏭":
          queue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.connection.dispatcher.end();
          queue.textChannel.send(`${user} ⏩ skipped the song`).catch(console.error);
          collector.stop();
          break;

        case "⏯":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            queue.textChannel.send(`${user} ⏸ paused the music.`).catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            queue.textChannel.send(`${user} ▶ resumed the music!`).catch(console.error);
          }
          break;

        case "🔇":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            queue.textChannel.send(`${user} 🔊 unmuted the music!`).catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            queue.textChannel.send(`${user} 🔇 muted the music!`).catch(console.error);
          }
          break;

        case "🔉":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel
            .send(`${user} 🔉 decreased the volume, the volume is now ${queue.volume}%`)
            .catch(console.error);
          break;

        case "🔊":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          queue.textChannel
            .send(`${user} 🔊 increased the volume, the volume is now ${queue.volume}%`)
            .catch(console.error);
          break;

        case "🔁":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.loop = !queue.loop;
          queue.textChannel.send(`Loop is now ${queue.loop ? "**on**" : "**off**"}`).catch(console.error);
          break;

        case "⏹":
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.songs = [];
          queue.textChannel.send(`${user} ⏹ stopped the music!`).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (PRUNING && playingMessage && !playingMessage.deleted) {
        playingMessage.delete({ timeout: 3000 }).catch(console.error);
        message.channel.stopTyping();
        if(config.Music_Status !== "Null") {
      client.user.setPresence({
    status: 'dnd',
    activity: {
        name: `${config.Client_Status}`
    }})
}
      }
    });
  }
};

function canModifyQueue(member) {
    const { channel } = member.voice;
    const botChannel = member.guild.me.voice.channel;

    if (channel !== botChannel) {
      member.send("You need to join the voice channel first!").catch(console.error);
      return false;
    }

    return true;
}
async function image(message, song) {
let { Canvas, createCanvas, loadImage } = require('canvas')
	const canvas = createCanvas(1600, 800)
  let id = song.url
  id = id.replace('https://www.youtube.com/watch?v=', '')
  let url = `https://i.ytimg.com/vi/${id}/sddefault.jpg`
  let title = song.title
  if(title.length > 50) {
  let num = title.length - 50
  num = title.length - num
  if (num !== 0) { 
  title = title.substring(0, num);
  title = `${title}..`
  }
  }
	const ctx = canvas.getContext('2d');
	const background = await loadImage(url);
  const channel = song.author
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
// https://media.discordapp.net/attachments/797822833115660298/800092004415045642/png1.png
// https://cdn.discordapp.com/attachments/700877793843609613/701602349470318622/aaa.png
	const Basic = await loadImage('https://cdn.discordapp.com/attachments/700877793843609613/701602349470318622/aaa.png');
console.log(Basic)
	ctx.drawImage(Basic, 0, 0, canvas.width, canvas.height);
  ctx.font = '60px sans-serif';
	ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
   ctx.textAlign = "center";
	 ctx.fillText(`${title}`, 801, 522,1531, 87);
  ctx.font = '45px sans-serif';
	ctx.fillStyle = '#D0D0D0';
  ctx.textBaseline = 'middle';
   ctx.textAlign = "center";
	 ctx.fillText(`${channel}`, 801, 615,1531, 87);
   const avatar = await loadImage(url);
  ctx.drawImage(avatar, 12, 89, 543, 320)
let photo = canvas.toBuffer()
return photo
}

async function image2(message, song) {
let { Canvas, createCanvas, loadImage } = require('canvas')
	const canvas = createCanvas(300, 200)
  let id = song.url
   console.log(id)
  id = id.replace('https://www.youtube.com/watch?v=', '')
  let url = `https://i.ytimg.com/vi/${id}/sddefault.jpg`
   console.log(url)
  let title = song.title
  if(title.length > 50) {
  let num = title.length - 50
  num = title.length - num
  if (num !== 0) { 
  title = title.substring(0, num);
  title = `${title}..`
  }
  }
	const ctx = canvas.getContext('2d');
	const background = await loadImage(url);
  const channel = song.author
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	const Basic = await loadImage('https://media.discordapp.net/attachments/797822833115660298/800092004415045642/png1.png');
	ctx.drawImage(Basic, 0, 0, canvas.width, canvas.height);
  ctx.font = '10px sans-serif';
	ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
   ctx.textAlign = "center";
	 ctx.fillText(`${title}`, 150, 139, 300, 23);
  ctx.font = '10px sans-serif';
	ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
   ctx.textAlign = "center";
	 ctx.fillText(`${channel}`, 150, 180, 300, 23);
   const avatar = await loadImage(url);
  ctx.drawImage(avatar, 97, 34, 110, 68)
 let photo = canvas.toBuffer()
 return photo
}