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
                "Remove Employee",
                "View all roles",
                "Add a Role",
                "Remove a Role",
                "View all departments",
                "Add a Department",
                "Remove a Department",
                "Update employee's manager",
                "View employees by manager",
                "Departmental salary budget",
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
            case "Remove Employee":
                removeEmployee();
                break;
            case "View all roles":
                getRoles();
                break;
            case "Add a Role":
                addRole();
                break;
            case "Remove a Role":
                removeRole();
                break;
            case "View all departments":
                getDept();
                break;
            case "Add a Department":
                addDept();
                break;
            case "Remove a Department":
                removeDept();
                break;
            case "Update employee's manager":
                updateManager();
                break;
            case "View employees by manager":
                getByManager();
                break;
            case "Departmental salary budget":
                totalSalaries();
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
        }
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

const getDept = () => {
    const query = 
        `SELECT id, name AS department FROM department;`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        startPrompt();
    });
};

const addDept = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter name of department:',
            validate: (name) => {
                if (name) {
                    return true
                } else {
                    return 'Please enter a valid name'
                }
            }
        }
    ]).then((ans) => {
        connection.query(`INSERT INTO department (name)
            VALUES ("${ans.name}");`,
            (err, res) => {
                if (err) throw err;
                startPrompt();
            }
        );
    });
}

const updateManager = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: 'Select employee to update:',
            choices: () => {
                let employeeArr = [];
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT CONCAT(first_name, " ", last_name) as name, id FROM employee`, (err, res) => {
                        if (err) throw err;
                        res.forEach((emp) => {
                            employeeArr.push({name: emp.name, value: emp.id});
                        });
                        resolve(employeeArr);
                    });
                });
            }
        },
        {
            type: 'list',
            name: 'manager',
            message: 'Select employee manager:',
            choices: (ans) => {
                let managerArr = [{name: "None", value: null}];
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT CONCAT(first_name, " ", last_name) as name, id FROM employee WHERE id NOT IN(${ans.employee})`, (err, res) => {
                        if (err) throw err;
                        res.forEach((manager) => {
                            managerArr.push({name: manager.name, value: manager.id});
                        });
                        resolve(managerArr);
                    });
                });
            }
        }
    ]).then((ans) => {
        connection.query(`UPDATE employee SET manager_id = ${ans.manager} WHERE id = ${ans.employee};`,
            (err, res) => {
                if (err) throw err;
                console.log("Employee records updated.")
                startPrompt();
            }
        );
    });
}

const getByManager = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: 'Select manager:',
            choices: () => {
                let employeeArr = [];
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT CONCAT(first_name, " ", last_name) as name, id FROM employee`, (err, res) => {
                        if (err) throw err;
                        res.forEach((emp) => {
                            employeeArr.push({name: emp.name, value: emp.id});
                        });
                        resolve(employeeArr);
                    });
                });
            }
        }
    ]).then((ans) => {
        const query = 
            `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title, department.name AS department, role.salary
            FROM employee
            LEFT JOIN role on role.id = employee.role_id
            LEFT JOIN department on department.id = role.department_id
            WHERE manager_id = ${ans.manager}`;

        connection.query(query, (err, res) => {
            if (err) throw err;

            if (res.length == 0) {
                console.log("This employee is not a manager");
            } else {
                console.table(res);
            }
            startPrompt();
        });
    });
}

const removeEmployee = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: 'Select employee to delete:',
            choices: () => {
                let employeeArr = [];
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT CONCAT(first_name, " ", last_name) as name, id FROM employee`, (err, res) => {
                        if (err) throw err;
                        res.forEach((emp) => {
                            employeeArr.push({name: emp.name, value: emp.id});
                        });
                        resolve(employeeArr);
                    });
                });
            }
        },
    ]).then((ans) => {
        connection.query(`DELETE FROM employee WHERE id = ${ans.employee};`,
            (err, res) => {
                if (err) throw err;
                console.log("Employee deleted.")
                startPrompt();
            }
        );
    });
}

const removeRole = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'role',
            message: 'Select role to delete:',
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
        }
    ]).then((ans) => {
        connection.query(`DELETE FROM role WHERE id = ${ans.role};`,
            (err, res) => {
                if (err) throw err;
                console.log("Role deleted.")
                startPrompt();
            }
        );
    });
}

const removeDept = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'department',
            message: 'Select department to delete:',
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
        }
    ]).then((ans) => {
        connection.query(`DELETE FROM department WHERE id = ${ans.department};`,
            (err, res) => {
                if (err) throw err;
                console.log("Department deleted.")
                startPrompt();
            }
        );
    });
}

const totalSalaries = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'department',
            message: 'Select department to view salary budget utilization:',
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
        }
    ]).then((ans) => {
        const query = 
            `SELECT SUM(role.salary) as total, department.name as name
            FROM employee
            LEFT JOIN role on role.id = employee.role_id
            LEFT JOIN department on department.id = role.department_id
            WHERE department.id = ${ans.department}`;
        connection.query(query,
            (err, res) => {
                if (err) throw err;
                let salaryTotal = res[0].total
                let department = res[0].name
                if (salaryTotal && department) {
                    console.log(`Salaries total $${salaryTotal} for ${department} department.`)
                } else {
                    console.log('No salary budget established for this department.')
                }
                startPrompt();
            }
        );
    });
}