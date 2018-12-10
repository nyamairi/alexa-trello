'use strict';
const Alexa = require('alexa-sdk');

const Trello = require('node-trello');
const trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);

const APP_ID = process.env.ALEXA_APP_ID;

const handlers = {
  'LaunchRequest': function () {
    this.emit('GetToDoList');
  },
  'GetToDoList': function () {
    getCards(process.env.TRELLO_TODO_LIST_ID).then((cards) => {
      if (cards.length === 0) {
        return 'やることリストは登録されていないみたいですね。';
      }

      const names = cards.map((card, i) => `${i + 1}: ${card.name}`).join('、');
      return `やることリストに全部で${cards.length}件の登録があります。${names}。以上です。`;
    }).then((message) => {
      this.response.speak(message);
      this.emit(':responseReady');
    }).catch(() => {
      this.response.speak('トレロさんとお話できませんでした…。');
      this.emit(':responseReady');
    });
  },
  'AMAZON.HelpIntent': function () {
    this.response.speak('「トレロでやることを教えて」と言うといいですよ。').listen('どうしますか？');
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    this.emit('AMAZON.StopIntent');
  },
  'AMAZON.StopIntent': function () {
    this.response.speak('じゃあね〜');
    this.emit(':responseReady');
  },
};

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

function getCards(todolistId) {
  return new Promise((resolve, reject) => {
    trello.get(`/1/lists/${todolistId}/cards`, (error, cards) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(cards);
    });
  });
}
