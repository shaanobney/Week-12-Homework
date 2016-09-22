var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var colors = require('colors');
var figlet = require('figlet');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

var chars = {
  'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
  'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚',
  'bottom-right': '╝', 'left': '║', 'left-mid': '╟', 'mid': '─',
  'mid-mid': '┼', 'right': '║', 'right-mid': '╢', 'middle': '│'
};

var productIds = [ ];

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'blubber',
    database: 'Bamazon'
});

figlet.text('Welcome To Bamazon', {
    font: 'Small Slant',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}, function(err, data) {
    console.log(data.yellow);
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Your lucky lotto number is ".rainbow + connection.threadId);
    start();
});

// GRABS INFO FROM PRODUCT TABLE, PRINTS APPLICABLE FIELDS FOR CUSTOMERS TO VIEW
var start = function() {
    connection.query('SELECT * FROM Products', function(err, res) {
        var table = new Table({
            head: ['Item ID', 'Product Name', 'PRICE', 'QTY'],
            chars: chars,
            style: {
                'padding-left': 1,
                'padding-right': 1,
                head: ['green'],
                border: ['grey'],
                compact : false
            },
            colWidths: [10, 42, 9, 6]
        });
        for (var i=0; i < res.length; i++) {
            var productArray = [res[i].ItemID, res[i].ProductName, res[i].Price, res[i].StockQuantity];
            productIds.push(res[i].ItemID);
            table.push(productArray);
        }
        console.log(table.toString());
        buyItem();
    });
};

//TAKES IN ITEM ID, MAKES SURE IT'S A VALID ITEM IN THE DATABASE
var buyItem = function() {
    inquirer.prompt([{
        name: "Item",
        type: "input",
        message: "Enter the ID of what you'd like to purchase".magenta,
        validate: function(value) {
            var length = productIds.length;
                for (var i =0; i < length; i++) {
                    if (productIds[i] == value)
                        return true;
                }
                    console.log("\nPlease Enter a Legit Item ID\n".red);
                    return false;
                }
    }, {
        name: "Qty",
        type: "input",
        message: "What quantity?".yellow,
        validate: function(value) {
            //TAKES IN QUANTIY, MAKES SURE ANSWER IS VALID
            if (isNaN(value) === false) {
                return true;
            } else {
                console.log("\nPlease enter a valid number\n".red);
                return false;
            }
        }
    }]).then(function(answer) {
        //QUERIES DB FOR PRODUCTS
        var ItemInt = parseInt(answer.Qty);
        connection.query("SELECT * FROM Products WHERE ?", [{ItemID: answer.Item}], function(err, data) {
            if (data[0].StockQuantity < ItemInt) {
                console.log("This product is currently out of stock\n".red);
                console.log("Please choose another product\n".green);
                start();
            } else {
                var updateQty = data[0].StockQuantity - ItemInt;
                var totalPrice = data[0].Price * ItemInt;
                connection.query('UPDATE products SET StockQuantity = ? WHERE ItemID = ?', [updateQty, answer.Item], function(err, results) {
                    if (err) {
                        throw err;
                    } else {
                        console.log("Grand Total: $ ".green + totalPrice);
                        inquirer.prompt({
                            name: "buyMore",
                            type: "confirm",
                            message: "Would you like to buy something else?".magenta,
                        }).then(function(answer) {
                            if (answer.buyMore === true) {
                                start();
                            } else {
                                console.log("Please come again!".green);
                                console.log("NO REFUNDS ".bgRed);
                                connection.end();
                            }
                        });
                    }
                });
            }
        });
    });
};