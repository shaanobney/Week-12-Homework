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

connection.connect(function(err) {
    if (err) throw err;
    console.log("Your lucky lotto number is ".rainbow + connection.threadId);
    appStart();
});