const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();
var Table = require('easy-table');

const PORT = process.env.PORT || 3001;
let prompt = inquirer.createPromptModule();

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    console.log(`Connected to the courses_db database.`)
);


const questions_main = [
    {
        type: 'list',
        message: 'What would you like to do?',
        name: 'choise',
        choices: [
            'View All Employees',
            'Add Employee',
            'Update Employee Role',
            'View All Roles',
            'Add Role',
            'View All Departments',
            'Add Department',
            'Quit',
        ],
    },
];

const questions_department = [
    {
        type: 'text',
        message: "What is the name of the department?",
        name: 'department',
    },
];

const questions_role = [
    {
        type: 'text',
        message: "What is the name of the role?",
        name: 'role',
    },
    {
        type: 'text',
        message: "What is the salary of the role?",
        name: 'salary',
    },
];
const questions_Employee = [
    {
        type: 'text',
        message: "What is the employee's first name?",
        name: 'first_name',
    },
    {
        type: 'text',
        message: "What is the employee's last name?",
        name: 'last_name',
    },
];
const questions_UpdateEmployee = [
]
function Log(data) {
    console.log(Table.print(data));
}

function viewAllEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary, manager_id as manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id',
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                Log(result);
                circularPrompt();
            }
        });
}

function viewAllRoles() {
    db.query('SELECT role.id, role.title, department.name as department, role.salary FROM role JOIN department ON role.department_id = department.id', function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            Log(result);
            circularPrompt();
        }
    });
}

function viewAllDepartments() {
    db.query('SELECT * FROM department', function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            Log(result);
            circularPrompt();
        }
    });
}

function addEmployee() {
    let empQuestions = questions_Employee;
    db.query('SELECT title FROM role', function (err, result) {
        const roles = result.map((elem) => {
            return JSON.stringify(elem).replace("{\"title\":\"", "").replace("\"}", "");
        });
        const roleQuestion = {
            type: 'list',
            message: "What is the employee's role?",
            name: 'role',
            choices: roles
        };
        empQuestions.push(roleQuestion);
        db.query('SELECT first_name, last_name FROM employee', function (err, result) {
            const managers = result.map((elem) => {
                return JSON.stringify(elem).replace("{\"first_name\":\"", "").replace("\",\"", " ").replace("last_name\":\"", "").replace("\"}", "");
            });
            managers.splice(0, 0, "None");
            const managerQuestion = {
                type: 'list',
                message: "Who is the employee's manager?",
                name: 'manager',
                choices: managers
            };
            empQuestions.push(managerQuestion);
            prompt(empQuestions)
                .then((response) => {
                    if (response.role && response.first_name && response.last_name) {
                        db.query(`SELECT id FROM role WHERE title = '${response.role}'`, function (err, result) {
                            let role_id = JSON.stringify(result).replace("[{\"id\":", "").replace("}]", "");
                            role_id = parseInt(role_id);
                            let managerData;
                            let query = `SELECT id FROM employee WHERE first_name = '${-1}'`;
                            if (response.manager !== 'None')
                            {
                                managerData = response.manager.split(" ");
                                query = `SELECT id FROM employee WHERE first_name = '${managerData[0]}' And last_name = '${managerData[1]}'`;
                            }
                            db.query(query, function (err, result) {
                                let manager_id = null;
                                if (result.length > 0){
                                
                                    manager_id = JSON.stringify(result).replace("[{\"id\":", "").replace("}]", "");
                                    manager_id = parseInt(manager_id);
                                }
                                const queryStr = manager_id ?`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${response.first_name}', '${response.last_name}', ${role_id}, ${manager_id});`:
                                `INSERT INTO employee (first_name, last_name, role_id) VALUES ('${response.first_name}', '${response.last_name}', ${role_id});`
                                db.query(queryStr, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.info(`Added ${response.first_name} ${response.last_name} to the database`);
                                        circularPrompt();
                                    }

                                });
                            });

                        });
                    }
                    else
                        console.log('no response');
                });
        });
    });
}

function addRole() {
    let roleQuestions = questions_role;
    db.query('SELECT name FROM department', function (err, result) {
        const departments = result.map((elem) => {
            return JSON.stringify(elem).replace("{\"name\":\"", "").replace("\"}", "");
        });
        const departmentQuestion = {
            type: 'list',
            message: 'Which department does the role belong to?',
            name: 'department',
            choices: departments
        };
        roleQuestions.push(departmentQuestion);
        prompt(roleQuestions)
            .then((response) => {
                if (response.role && response.salary && response.department) {
                    db.query(`SELECT id FROM department WHERE name = '${response.department}'`, function (err, result) {
                        const id = JSON.stringify(result).replace("[{\"id\":", "").replace("}]", "");
                        const queryStr = `INSERT INTO role (title, salary, department_id) VALUES ('${response.role}', ${response.salary}, ${parseInt(id)});`;
                        db.query(queryStr, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            else
                                console.log(`Added ${response.role} to the database`);
                            circularPrompt();
                        });
                    });
                }
                else
                    console.log('no response');
            });
    });
}

function addDepartment() {
    prompt(questions_department)
        .then((response) => {
            if (response.department) {
                db.query(`INSERT INTO department (name) VALUES ('${response.department}')`, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(`Added ${response.department} to the database`);
                        circularPrompt();
                    }
                });
            }
        });
}

function updateEmployeeRole() {
    let empUpdateQuestions = questions_UpdateEmployee;
    db.query('SELECT first_name, last_name FROM employee', function (err, result) {
        const employees = result.map((elem) => {
            return JSON.stringify(elem).replace("{\"first_name\":\"", "").replace("\",\"", " ").replace("last_name\":\"", "").replace("\"}", "");
        });
    const empQuestion = {
            type: 'list',
            message: "Which employee's role do you want to update?",
            name: 'employee',
            choices: employees
        };
        empUpdateQuestions.push(empQuestion);
        db.query('SELECT title FROM role', function (err, result) {
            const roles = result.map((elem) => {
                return JSON.stringify(elem).replace("{\"title\":\"", "").replace("\"}", "");
            });
            const roleQuestion = {
                type: 'list',
                message: "Which role do you want to assign to the selected employee?",
                name: 'role',
                choices: roles
            };
            empUpdateQuestions.push(roleQuestion);
            prompt(empUpdateQuestions)
                .then((response) => {
                    if (response.role && response.employee) {
                        db.query(`SELECT id FROM role WHERE title = '${response.role}'`, function (err, result) {
                            let role_id = JSON.stringify(result).replace("[{\"id\":", "").replace("}]", "");
                            role_id = parseInt(role_id);
                            const employeeData = response.employee.split(" ");
                            const query = `SELECT id FROM employee WHERE first_name = '${employeeData[0]}' And last_name = '${employeeData[1]}'`;
                            db.query(query, function (err, result) {
                                let employee_id = JSON.stringify(result).replace("[{\"id\":", "").replace("}]", "");
                                employee_id = parseInt(employee_id);
                                const queryStr = `UPDATE employee SET role_id = ${role_id} WHERE id = ${employee_id};`;
                                db.query(queryStr, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.info(`Updated employee's role`);
                                        circularPrompt();
                                    }

                                });
                            });

                        });
                    }
                    else
                        console.log('no response');
                });
        });
    });
}
let currentChoise = '';

function circularPrompt() {
    if (currentChoise !== 'Quit') {
        askTask();
    }
}
const askTask = () => {
    prompt(questions_main)
        .then((response) => {
            currentChoise = response.choise;
            switch (response.choise) {
                case 'View All Employees':
                    viewAllEmployees();
                    break;
                case 'View All Roles':
                    viewAllRoles();
                    break;
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
            }
        });
};

function init() {
    askTask();
}
// const askTheTask = () => {
//     let response = prompt(questions_main)
//         .then((resp) => {
//             choise = resp.choise;
//             switch (resp.choise) {
//                 case 'View All Employees':
//                     viewEmployees(choise);
//                     break;
//             }
//         })
// };
// function viewEmployees(choise) {
//     db.query('SELECT employee.id FROM employee',
//         function (err, result) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 console.log(result);
//             }

//             if (choise !== 'Quit') {
//                 console.log('next');
//                 askTheTask();
//             }
//         });
// }

init();
