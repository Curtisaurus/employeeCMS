// requiring dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
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
            name: "menu",
            message: "Please select an option:",
            choices: [
                "View all employees",
                "Add Employee",
                "View all roles",
                "Add a Role",
                "View all departments",
                "Add a Department",
                "Exit",
                new inquirer.Separator()
            ]
        }
    ]).then((answer) => {
        switch (answer.menu) {
            case "View all employees":
                getEmployees();
                break;
            default:
                connection.end();
        }
    })
}

getEmployees = () => {
    const query = 
        `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
        CONCAT(manager.first_name, " ", manager.last_name) AS manager
        FROM employee
        LEFT JOIN role on role.id = employee.role_id
        LEFT JOIN department on department.id = role.department_id
        LEFT JOIN employee AS manager on manager.id = employee.manager_id`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startPrompt();
    })
}