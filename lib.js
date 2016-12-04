// add newline to console
exports.newLine = function() {
    console.log("\n");
}

// add delimiter line to console
exports.delimiterLine = function() {
    console.log("\n*****************************\n");
}

// return empty pizza object
exports.getEmptyPizza = function(text) {
    var pizza = new Object();
    pizza.size = "";
    pizza.crust = "";
    pizza.sauce = "";
    pizza.toppings = "";
    pizza.price = 0;

    return pizza;
}

// parse entities identified by LUIS and update the pizza object
exports.parsePizza = function(pizza, entities) {
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        switch (entity.type) {
            case 'Size':
                pizza.size = entity.entity;
                pizza = setSizePrice(pizza, pizza.size.toUpperCase());
                break;
            case 'Crust':
                pizza.crust = entity.entity;
                break;
            case 'Sauce':
                pizza.sauce = entity.entity;
                break;
            case 'Toppings':
                pizza.toppings += entity.entity + ", ";
                break;
            /*case 'builtin.number':
            	pizza.quantity = entity.entity;
                break;
            */
        }
    }
    return pizza;
}

// polish pizza, remove unncessary charecters
exports.polishPizza = function(pizza) {
    if (pizza.toppings) {
        pizza.toppings = removeChar(pizza.toppings, ',');
    }
    if (pizza.sauce) {
        pizza.sauce = removeChar(pizza.sauce, ',');
    }
    return pizza;
}

// return user readable pizza string
exports.userReadablePizzaString = function(pizza) {
    var returnString = "You have ordered one ";
    if (pizza.size) {
        returnString += pizza.size;
    }
    if (pizza.crust) {
        returnString += " " + pizza.crust;
    }
    returnString += " pizza";
    if (pizza.sauce) {
        returnString += " with " + pizza.sauce + " sauce and ";
    }
    else{
    	returnString += " with ";
    }
    if (pizza.toppings) {
        returnString += pizza.toppings + " toppings.";
    }
    if (pizza.price) {
        returnString += " Your bill is $" + pizza.price + ".";
    }
    return returnString;
}


// remove charecter
function removeChar(str, char) {
    if (str.includes(char)) {
        return str.substr(0, str.lastIndexOf(char));

    }
    return str;
}

// get price for size
function setSizePrice(pizza, size) {
    switch (size) {
        case 'LARGE':
        case 'FAMILY':
            pizza.price += 15;
            break;

        case 'SMALL':
        case 'SINGLE':
            pizza.price += 5;
            break;

        case 'MEDIUM':
            pizza.price += 10;
            break;
    }
    return pizza;
}