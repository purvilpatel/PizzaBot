var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
// Load the http module to create an http server.
var httpServer = require("./httpServer.js");
// Load the lib module to support custom funcitons
var lib = require("./lib.js");

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


//=========================================================
// Bots Dialogs
//=========================================================
var model = process.env.model || 'https://api.projectoxford.ai/luis/v2.0/apps/476cdbb7-2a92-4082-b89e-7a956236b047?subscription-key=274a03130a9141a3b10eba6a0b617cd6&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({
    recognizers: [recognizer]
});

bot.dialog('/', dialog);

// Add intent handlers
dialog.matches('Greeting', [
    function(session) {
        builder.Prompts.text(session, "Hello, what is your name?");
    },
    function(session, results) {
        var string = "{\"name\":\"" + results.response + "\"}";
        fs.writeFile('./data/name.json', string, function(err) {
            if (err) return console.log(err);
            console.log('Hello World > helloworld.txt');
        });
        session.send('Hello %s!', results.response);
    }
]);

// Add intent handlers
dialog.matches('OrderPizza', function(session, args, next) {
    var pizza = lib.getEmptyPizza();
    pizza = lib.parsePizza(pizza, args.entities);
    pizza = lib.polishPizza(pizza);
    lib.newLine();
    lib.newLine();
    console.log(pizza);
    session.send(lib.userReadablePizzaString(pizza));
});

dialog.onDefault(function(session, args, next) {
    console.log(args);
    session.send(JSON.stringify(args));
});