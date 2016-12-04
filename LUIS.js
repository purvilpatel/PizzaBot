var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
// Load the http module to create an http server.
var httpServer = require("./httpServer.js");
// Load the lib module to support custom funcitons
var lib = require("./lib.js");

// gloabl pizza object to store order
var pizza = null;

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
        session.send('Hello %s! I am a pizza bot. I can help you place your order.\n\nPlease type menu or profile for options.', results.response);
    }
]);

// Add intent handlers
dialog.matches('OrderPizza', function(session, args, next) {
    // if pizza is null, create empty pizza
    if (!pizza)
        pizza = lib.getEmptyPizza();
    pizza = lib.parsePizza(pizza, args.entities);
    pizza = lib.polishPizza(pizza);
    lib.newLine();
    console.log(pizza);
    //session.send(lib.userReadablePizzaString(pizza));
    session.replaceDialog('/VerifyOrder');
});

bot.dialog('/VerifyOrder', [
    
    function(session, args, next) {
        if (!pizza.size || pizza.size == "" || pizza.size == '') {
            console.log("pizza.size : " + pizza.size);
            var prompt = "Do you want small, medium or large pizza?";
            session.send(prompt);
            // call root dialog, so that we can parse user response with LUIS
            session.beginDialog('/');
        } else if (!pizza.crust || pizza.crust == "" || pizza.crust == '') {
            console.log("pizza.crust : " + pizza.crust);
            var prompt = "Would you like thin crust or hand tossed pizza?";
            session.send(prompt);
            // call root dialog, so that we can parse user response with LUIS
            session.beginDialog('/');
        } else if (!pizza.sauce || pizza.sauce == "" || pizza.sauce == '') {
            console.log("pizza.sauce : " + pizza.sauce);
            var prompt = "What sauce would you like?";
            session.send(prompt);
            // call root dialog, so that we can parse user response with LUIS
            session.beginDialog('/');
        } else if (!pizza.toppings || pizza.toppings == "" || pizza.toppings == '') {
            console.log("pizza.toppings : " + pizza.toppings);
            var prompt = "Do you like to add some toppings?";
            session.send(prompt);
            // call root dialog, so that we can parse user response with LUIS
            session.beginDialog('/');
        }
        else{
            // ask for user address
            session.beginDialog('/Address');
        }
    }
]);

bot.dialog('/Address', [
    function(session, args, next) {
        session.send(lib.userReadablePizzaString(pizza));
        session.send("Thank you for your order. You will recieve your delicious pizza within 25 minutes.");
    }
]);

dialog.onDefault(function(session, args, next) {
    console.log(args);
    session.send(JSON.stringify(args));
});