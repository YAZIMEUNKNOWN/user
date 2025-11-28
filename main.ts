import { Bot } from 'https://deno.land/x/grammy@v1.8.3/mod.ts';
import { uniqueNamesGenerator, Config, names, colors, animals, adjectives, NumberDictionary } from 'https://jspm.dev/unique-names-generator';
import { Composer } from "https://deno.land/x/grammy@v1.12.0/composer.ts";
import "https://deno.land/x/dotenv/load.ts";

export const bot = new Bot(Deno.env.get('8383713323:AAE-YmgQWvFjiDtXDHisuNgp5-93UBQHXMc'));

// initialize composer instance
const composer = new Composer();


const generateNewUsername = () => {
  const dictionaries = [adjectives, names, colors, animals];
  const randomDictionaries = [];
  for (let i = 0; i < 2; i++) {
    const index = Math.floor(Math.random() * dictionaries.length);
    randomDictionaries.push(dictionaries.splice(index, 1)[0]);
  }

function randomSeparator(): string {
  const separators = ['_', ''];
  const index = Math.floor(Math.random() * separators.length);
  return separators[index];
  }
const dictionariesType: Config = {
    dictionaries: [...randomDictionaries],
    length: 2,
    separator: randomSeparator(),
    style: 'lowerCase'
  }
  const randomUsername: string = uniqueNamesGenerator(dictionariesType);
  return randomUsername;
}


composer.command("start", async (ctx, next) => {
  const name = `${ctx.from.first_name}`;
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🚀 Generate username", callback_data: "generate" },
      ],
    ],
  };
   // Wait for 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
   // deleting /start command

  await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
  await ctx.replyWithAnimation("https://gifdb.com/images/file/telegram-logo-airplane-flying-animation-5k5b1k28xhqq4bjk.gif");
  await ctx.reply("✖️\n\n\n\n\n                      ⚠️ ATTENTION! ⚠️\n\nThis bot won't automatically change your current telegram username, you still need to set it manually. \n\nThis bot is only helping you generating random username(s).\n\n\n\n\n✖️");
  await ctx.reply(
    `Hi ${name}👋, welcome to Telegram Username Generator bot! \n\nPress the button ⬇️ to start generating your username.`,
    { reply_markup: keyboard },
  );

  
  await next();
});

let messages = {
  message0: null,
  message1: null,
  message2: null,
  message3: null
};
composer.on("callback_query", async (ctx, next) => {
  if (ctx.callbackQuery.data === "generate") {
    // generate suggested username and send message
    const username = ctx.callbackQuery.from.username;
    const suggestedUsername = generateNewUsername();
    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Use suggested", callback_data: `use ${suggestedUsername}` },
          { text: "🔄 Generate another", callback_data: "generate" },
        ],
      ],
    };

    // send message with suggested username
    await ctx.editMessageText(
      `Your current username is @${username || "not set"}\n\nHere's another suggestion: \n\n\n@${suggestedUsername}\n\n\n✖️✖️✖️✖️✖️`,
      { reply_markup: keyboard },
    );}
    
    
    else if (ctx.callbackQuery.data.startsWith("use ")) {
    const username = ctx.callbackQuery.data.split(" ")[1];
    await ctx.answerCallbackQuery(`You have selected @${username}`);
    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ OK, use this", callback_data: `use-this ${username}` },
          { text: "🔄 No, repeat", callback_data: "generate" },
        ],
      ],
    };

    // send message with selected username and delete previous message
    messages.message0 = await ctx.editMessageText(
      `You have selected:\n\n➡️ @${username}\n\n Are you sure?`,
      { reply_markup: keyboard },
    );
    
  } else if (ctx.callbackQuery.data.startsWith("use-this ")) {
    const username = ctx.callbackQuery.data.split(" ")[1];
    try {
      // send message with selected username
      ctx.api.deleteMessage(messages.message0.chat.id, messages.message0.message_id);
      messages.message1 = await ctx.reply("✔️ Please copy your new username below:");
      messages.message2 = await ctx.reply(`@${username}`);
      
      await ctx.answerCallbackQuery("Please copy it manually.");
  
      // add "Generate another?" button
      const keyboard = {
        inline_keyboard: [
          [
            { text: "🔄 Generate another", callback_data: "another" },
          ],
        ],
      };
    
       
      // add the keyboard to the message
      messages.message3 = await ctx.reply("Or generate another username again.", { reply_markup: keyboard });

      }catch (err) {
        console.log(err);
        ctx.reply("Error copying username.");
      }
    }
      await next();

    });
      // delete previous messages when "Yes" button is clicked
      composer.on("callback_query", async (ctx, next) => {
        if (ctx.callbackQuery.data === "another" && messages.message1 && messages.message2 && messages.message3)
            {
          try {
            ctx.api.deleteMessage(messages.message1.chat.id, messages.message1.message_id);
            ctx.api.deleteMessage(messages.message2.chat.id, messages.message2.message_id);
            ctx.api.deleteMessage(messages.message3.chat.id, messages.message3.message_id);
            const name = `${ctx.callbackQuery.from.first_name}`;
            const username = ctx.callbackQuery.from.username;
            const suggestedUsername = generateNewUsername();
            const Keyboard = {
              inline_keyboard: [
                [
                  { text: "✅ Use suggested", callback_data: `use ${suggestedUsername}` },
                  { text: "🔄 Generate another", callback_data: "generate" },
                ],
              ],
            };
            
            await ctx.reply(
              `Hi ${name}👋, your current username is: \n@${username || "not set"} \n\nHere's another suggestion: \n\n\n@${suggestedUsername}\n\n\n✖️✖️✖️✖️✖️`,
              { reply_markup: Keyboard },
            );
          } catch (err) {
            console.log(err);
            ctx.reply("Error deleting message.");
            
          }
        }
        await next();
  
});

bot.use(composer);
// bot.start(() => {
//   console.log('Bot started');
// });
