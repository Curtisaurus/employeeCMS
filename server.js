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
            case "Add Employee":
                addEmployee();
                break;
            case "View all roles":
                getRoles();
                break;
            case "Add a Role":
                addRole();
                break;
            default:
                connection.end();
        }
    })
}

const getEmployees = () => {
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

const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Employee first name:',
            validate: (name) => {
                if (name) {
                    return true
                } else {
                    return 'Please enter a name'
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Employee last name:',
            validate: (name) => {
                if (name) {
                    return true
                } else {
                    return 'Please enter a name'
                }
            }
        },
        {
            type: 'list',
            name: 'role',
            message: 'Select employee role:',
            choices: () => {
                let roleArr = [];
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT title, id from role`, (err, res) => {
                        if (err) throw err;
                        res.forEach((role) => {
                            roleArr.push({name: role.title, value: role.id});
                        });
                        resolve(roleArr);
                    });
                });
            }
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Select employee manager:',
            choices: () => {
                let managerArr = [{name: "None", value: null}];
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT CONCAT(first_name, " ", last_name) as name, id FROM employee`, (err, res) => {
                        if (err) throw err;
                        res.forEach((emp) => {
                            managerArr.push({name: emp.name, value: emp.id});
                        });
                        resolve(managerArr);
                    });
                });
            }
        },
    ]).then((ans) => {
        connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
            VALUES ("${ans.firstName}", "${ans.lastName}", ${ans.role}, ${ans.manager});`,
            (err, res) => {
                if (err) throw err;
                startPrompt();
            }
        );
    });
}

const getRoles = () => {
    const query = 
        `SELECT role.id, role.title AS role, department.name AS department, role.salary
        FROM role
        LEFT JOIN department on role.department_id = department.id;`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startPrompt();
    });
};

const addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter title of role:',
            validate: (name) => {
                if (name) {
                    return true
                } else {
                    return 'Please enter a valid title'
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter salary:',
            validate: (salary) => {
                console.log(typeof(salary))
                if (typeof(parseFloat(salary)) == 'number') {
                    return true
                } else {
                    return 'Please enter a valid currency amount'
                }
            }
        },
        {
            type: 'list',
            name: 'department',
            message: 'Select department of role:',
            choices: () => {
                let deptArr = [];
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT name, id from department`, (err, res) => {
                        if (err) throw err;
                        res.forEach((dept) => {
                            deptArr.push({name: dept.name, value: dept.id});
                        });
                        resolve(deptArr);
                    });
                });
            }
        },
    ]).then((ans) => {
        connection.query(`INSERT INTO role (title, salary, department_id)
            VALUES ("${ans.title}", "${ans.salary}", ${ans.department});`,
            (err, res) => {
                if (err) throw err;
                startPrompt();
            }
        );
    });
}