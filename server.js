// requiring dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
// for using environment variables
require('dotenv').config();

connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'employees_DB'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
    startPrompt();
})

const startPrompt = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "intro",
            choices: [
                "again",
                "exit"
            ]
        }
    ]).then((answer) => {
        if (answer.intro == 'exit') {
            connection.end();
        } else {
            startPrompt();
        }
    })
}