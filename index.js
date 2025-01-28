//Этот код создает и управляет ботами в Telegram, позволяя пользователям играть в простые игры,
//отслеживать свои достижения и взаимодействовать с приложением через веб-интерфейс.

const express = require("express");
const path = require("path");
const fs = require('fs');
const readline = require('readline');
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = "8072764730:AAGIydJzdHG1odoDvovRbCMkqRM7HfhxIhQ";
const server = express();
const bot = new TelegramBot(TOKEN, {
    polling: true
});
const port = process.env.PORT || 5000;
const gameName = "findSushiPair";
const queries = {};
server.use(express.static(path.join(__dirname, 'findPairGameTelegram')));

const promo1path = path.join(__dirname,'promocode1.txt');

let map1 = readFileToMap(promo1path)
  .then(set => console.log(set))
  .catch(err => console.error(err));

bot.on('web_app_data', (msg) => {
    const chatId = msg.chat.id;
    const data = msg.web_app_data.data;
  
    console.log(msg);
    console.log(data);
  
    bot.sendMessage(chatId, `Получили информацию из веб-приложения: ${data}`);
  });

bot.onText(/win1/, (msg) => {
    console.log('Считаем скидку по первой категории')

});

bot.onText(/win2/, (msg) => {
    console.log('Считаем скидку по второй категории')

});
bot.onText(/win3/, (msg) => {
    console.log('Считаем скидку по третьей категории')

});
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot implements a T-Rex jumping game. Say /game if you want to play."));


bot.onText(/start|game/, (msg) => {
    bot.sendGame(msg.from.id, gameName)
    bot.sendMessage(msg.from.id, "Для начала игры нажми кнопку Играть");
});

/*
bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = "https://academik2006.github.io/findPairGameFront/";
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });
    }
});
*/
bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameName
    }]);
});
server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options,
        function (err, result) {});
});
server.listen(port);

function readFileToMap(filePath) {
    return new Promise((resolve, reject) => {
      let map = new Map;
      let lineNumber = 0;    

      const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        console: false
      });

      readInterface.on('line', function(line) {
        map.set(lineNumber, line);
        lineNumber++;
      });

      readInterface.on('close', function() {
        resolve(map);
        console.log(map.size)        
      });

      readInterface.on('error', function(err) {
        reject(err);
      });
    });
}