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

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'blubber',
    database: 'Bamazon'
});

figlet.text('Bamazon Manager', {
    font: 'Small Slant',
    horizontalLayout: 'fitted',
    verticalLayout: 'fitted'
}, function(err, data) {
    console.log(data.yellow);
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Your lucky lotto number is ".rainbow + connection.threadId);
    appStart();
});

//MENU FOR MANAGEMEN TYPES
var appStart = function() {
    inquirer.prompt([{
        name: "Menu",
        type: "rawlist",
        message: "MANAGEMENT! Type the number of the MANAGEMENT thing you wanna do".green,
        choices:['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
    }]).then(function(answer) {
        switch(answer.Menu) {
            case 'View Products for Sale': 
            productsForSale();
            break;
            case 'View Low Inventory':
            lowInventory();
            break;
            case 'Add to Inventory':
            addInventory();
            break;
            case 'Add New Product':
            newProduct();
            break;
        }
    });
}  
    //WRAP IT UP
    function appContinue() {
        inquirer.prompt({
            name: "continue",
            type: "confirm",
            message: "Would you like to go back to the main menu?",
        }).then(function(answer) {
            if (answer.continue == true) {
                appStart();
            } else {
                console.log("GOODBYE!");
                connection.end();
            }
        });
    };

    //LITS CURRENT INVENTORY
    function productsForSale() {
        figlet.text('Current Inventory', {
            font: 'Small Slant',
            horizontalLayout: 'fitted',
            verticalLayout: 'fitted'
        }, function(err, data) {
            console.log(data.yellow);
        });
        connection.query('SELECT * FROM Products', function(err, res) {
            var table = new Table({
                head: ['ItemID', 'Product Name', 'PRICE', 'QTY'],
                colWidths: [10, 42, 9, 6]
            });
            for (var i=0; i < res.length; i++) {
                var productArray = [res[i].ItemID, res[i].ProductName, res[i].Price, res[i].StockQuantity];
                table.push(productArray);
            }
            console.log(table.toString());
            appStart();
        });
    }
    //SHOWS INVENTORY WITH QTY UNDER FIVE
    function lowInventory() {
        figlet.text('Low Inventory', {
            font: 'Small Slant',
            horizontalLayout: 'fitted',
            verticalLayout: 'fitted'
        }, function(err, data) {
            console.log(data.yellow);
        });
        connection.query('SELECT * FROM Products', function(err, res) {
            var table = new Table({
                head: ['ItemID', 'ProductName', 'PRICE', 'QTY'],
                colWidths: [10, 42, 9, 6]
            });
            for (var i=0; i < res.length; i++) {
                if (res[i].StockQuantity < 5) {
                    var productArray = [res[i].ItemID, res[i].ProductName, res[i].Price, res[i].StockQuantity];
                    table.push(productArray);
                }
            }
            console.log(table.toString());
            appStart();
        });
    }
    //UPDATES QTY OF INVENTORY ITEMS
    function addInventory() {
        console.log(figlet.textSync('Add Inventory', {
            font: 'Small Slant',
            horizontalLayout: 'fitted',
            verticalLayout: 'fitted'
        }));
        connection.query('SELECT * FROM Products', function(err, res) {
            var table = new Table({
                head: ['Item ID', 'Product Name', 'PRICE', 'QTY'],
                colWidths: [10, 42, 9, 6]
            });
            for (var i=0; i < res.length; i++) {
                var productArray = [res[i].ItemID, res[i].ProductName, res[i].Price, res[i].StockQuantity];
                table.push(productArray);
            }
            console.log('\n');
            console.log(table.toString());
            console.log('\n');
        });
        inquirer.prompt([{
            name:'ItemID',
            type:'input',
            message: '\n\nEnter the ID of product to increase'
        }, {
            name: 'qty',
            type:'input',
            message: 'Enter QTY'
        }]).then(function(answer) {
            var addAmount = (parseInt(answer.qty));
            //GRABS STOCK QUANTITY AND PERFORMS MATH
            connection.query("SELECT * FROM Products WHERE ?", [{ItemID: answer.ItemID}], function(err, res) {
                if(err) {
                    throw err;
                } else {
                    var updateQty = (parseInt(res[0].StockQuantity) + addAmount);
                }
                connection.query('UPDATE products SET StockQuantity = ? WHERE ItemID = ?', [updateQty, answer.ItemID], function(err, results) {
                    if(err) {
                        throw err;
                    } else {
                        console.log('New Inventory Item Added!\n');
                        appContinue();
                    }
                });
            });
        });
    }
    //UPDATE DATABASE WITH NEW PRODUCT. NEVER ADDED ANY VALIDATION, SO ANY TYPO WILL DEEP SIX THIS THING.
    function newProduct() {
        console.log(figlet.textSync('Add Product', {
            font: 'Small Slant',
            horizontalLayout: 'fitted',
            verticalLayout: 'fitted'
        }));
        inquirer.prompt([{
            name: "product",
            type: "input",
            message: "Type the name of the Product you want to add"
        }, {
            name: "department",
            type: "input",
            message: "Type the Department name of the Product you want to add"
        }, {
            name: "price",
            type: "input",
            message: "Enter the price of the product without currency symbols"
        }, {
            name: "quantity",
            type: "input",
            message: "Add Quantity"
        }]).then(function(answers) {
            var ProductName = answers.product;
            var DepartmentName = answers.department;
            var Price = answers.price;
            var StockQuantity = answers.quantity;
            connection.query('INSERT INTO Products (ProductName, DepartmentName, Price, StockQuantity) VALUES (?, ?, ?, ?)', [ProductName, DepartmentName, Price, StockQuantity], function(err, data) {
                if (err) {
                    throw err;
                } else {
                console.log('\n\nProduct: ' + ProductName + ' added successfully!\n\n');
                appContinue();
                }
            });
        });
    }