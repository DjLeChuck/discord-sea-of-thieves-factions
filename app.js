const BOT_VERSION = "v1.0.1";

const Discord = require("discord.js");
const client = new Discord.Client();
const COMMAND_TRIGGER = "!sot";
const GOLD = "💰";
const SKULL = "💀";
const CHICKEN = "🐔";
const GEM = "💎";
const REGEX_MASK = /^(.*?)(💰([0-9]+))? ?(💀([0-9]+))? ?(🐔([0-9]+))? ?(💎([0-9]+))?$/i;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async message => {
  // Ignore all bots.
  if (message.author.bot) {
    return;
  }

  const { content, member, channel } = message;

  if (COMMAND_TRIGGER !== content.substring(0, COMMAND_TRIGGER.length)) {
    return;
  }

  const [ command, ...args ] = content.replace(COMMAND_TRIGGER, "").trim().split(" ");

  // Get existing values
  let { displayName } = member;
  const matches = displayName.match(REGEX_MASK);
  let [ , nickname, , nbGold, , nbSkulls, , nbChickens, , nbGems ] = matches;
  let newNickname = "";
  nickname = nickname.trim();

  switch (command) {
    // Reset the nickname = remove all the factions parts
    case "reset":
      newNickname = nickname;
      break;
    // Init the nickname with all factions values
    case "init":
      const [ g, s, c, gem ] = args;
      newNickname = `${nickname} ${GOLD}${g}${SKULL}${s}${CHICKEN}${c}`;

      if (undefined !== gem) {
        newNickname = `${newNickname}${GEM}${gem}`;
      }
      break;
    // Update the Gold Hoarders
    case "gold":
    case "g":
      newNickname = update(displayName, GOLD, args[0]);
      break;
    // Update the Order of Souls
    case "skull":
    case "s":
      newNickname = update(displayName, SKULL, args[0]);
      break;
    // Update the Merchant Alliance
    case "chicken":
    case "c":
      newNickname = update(displayName, CHICKEN, args[0]);
      break;
    // Update the Legend
    case "gem":
      newNickname = update(displayName, GEM, args[0]);
      break;
    // Display help about the bot
    case "help":
    default:
      const help = `**Sea of Thieves - Factions - ${BOT_VERSION}**

__List of available commands:__

- **init GOLD SKULL CHICKEN _GEM_**: replace each faction with your current level, GEM is optional
- **gold VALUE / g VALUE**: update your Gold Hoarders level ${GOLD}
- **skull VALUE / s VALUE**: update your Order of Souls level ${SKULL}
- **chicken VALUE / c VALUE**: update your Merchant Alliance level ${CHICKEN}
- **gem VALUE**: update your Legend level ${GEM}
- **reset** : Restore your nickname by removing all the factions levels
`;

      return channel.send(help);
      break;
  }

  // Check if we can update the user nickname
  if (!message.guild.me.hasPermission("MANAGE_NICKNAMES")) {
    return message.reply("Sorry, I don't have permission to change your nickname!");
  }

  // Apply the new nickname
  try {
    await member.setNickname(newNickname);
  } catch (e) {
    message.reply("sorry, I was not able to do this...");
  }
});

client.login(process.env.BOT_TOKEN);

/**
 * Update the given nickname by replacing one of the faction level by the new one.
 */
function update(nickname, mask, value) {
  return nickname.replace(new RegExp(`${mask}[0-9]+`), `${mask}${value}`);
}
