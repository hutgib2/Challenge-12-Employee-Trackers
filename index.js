
//connect to database
const mysql = require("mysql2");
const inquirer = require("inquirer");


//check port
const connection = mysql.createConnection( {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Chelsea2005!#%",
    database: "employee_trackerDB"
}, function (err) {
    if (err) throw err;
    console.log("connected as id" + connection.threadId + "\n");
    prompt();
});

function prompt(){
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: [
                "View All Employees",
                "Add Employee",
                "Update Employee Role",
                "View All Roles",
                "Add Role",
                "View All Departments",
                "Add Department",
                "Quit"
            ]
        }
    ]).then(function(response){
        switch(response.choice){
            case "View All Employees":
                viewAllEmployees();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "View All Roles":
                viewAllRoles();
                break;
            case "Add Role":
                addRole();
                break;
            case "View All Departments":
                viewAllDepartments();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Quit":
                connection.end();
                break;
        }
    })
}
// function to view all employees
async function viewAllEmployees() {
    const employees = await connection.promise().query("SELECT * FROM employee");
    console.table(employees[0]);
    prompt();
}
//function to add employee
async function addEmployee() {
    const roles = await connection.promise().query("SELECT * FROM role");
    const roleChoices = roles[0].map(({ id, title }) => ({
        name: title,
        value: id
    }));
    if (roleChoices.length === 0) {
        console.log("Please add a role first!");
        return prompt();
    }

    const employees = await connection.promise().query("SELECT * FROM employee");
    const employeeChoices = employees[0].map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?"
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?"
        },
        {
            type: "list",
            name: "roleId",
            message: "What is the employee's role?",
            choices: roleChoices
        },
        {
            type: "list",
            name: "managerId",
            message: "Who is the employee's manager?",
            choices: [{ name: "None", value: null }, ...employeeChoices]
        }
    ]);
    await connection.promise().query("INSERT INTO employee SET ?", {
        first_name: firstName,
        last_name: lastName,
        role_id: roleId,
        manager_id: managerId
    });
    console.log("Employee added successfully!");
    prompt();
}

// function to update employee role
async function updateEmployeeRole() {
    
    const employees = await connection.promise().query("SELECT * FROM employee");
    const employeeChoices = employees[0].map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    if (employeeChoices.length === 0) {
        console.log("Please add an employee first!");
        return prompt();
    }

    const { employeeId } = await inquirer.prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee would you like to update?",
            choices: employeeChoices
        }
    ]);
    const roles = await connection.promise().query("SELECT * FROM role");
    const roleChoices = roles[0].map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const { roleId } = await inquirer.prompt([
        {
            type: "list",
            name: "roleId",
            message: "What is the employee's new role?",
            choices: roleChoices
        }
    ]);

    await connection.promise().query("UPDATE employee SET role_id = ? WHERE id = ?", [
        roleId,
        employeeId
    ]);
    console.log("Employee role updated successfully!");
    prompt();
}

//function to view all roles
async function viewAllRoles() {
    const roles = await connection.promise().query("SELECT * FROM role");
    console.table(roles[0]);
    prompt();
}


//function to add a role
async function addRole () {
    const departments = await connection.promise().query("SELECT * FROM department");
    const departmentList = departments[0].map(({ id, name }) => ({
        name: name,
        value: id
    }));

    if (departmentList.length === 0) {
        console.log("Please add a department first!"); 
        return prompt();
    }

    const {title, salary, departmentId} = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the name of the role you would like to add?"
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary of the role you would like to add?"
        },
        {
            type: "list",
            name: "departmentId",
            message: "What is the department of the role you would like to add?",
            choices: departmentList
        }
    ]);
    await connection.promise().query("INSERT INTO role SET ?", {
        title: title,
        salary: salary,
        department_id: departmentId
    });
    console.log("Role added successfully!");
    prompt();
}

//Function to view all departments
async function viewAllDepartments() {
    const departments = await connection.promise().query("SELECT * FROM department");
    console.table(departments[0]);
    prompt();
}



//Function to add department 
async function addDepartment() {
    const { departmentName } = await inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "What is the name of the department you would like to add?"
        }
    ]);
    await connection.promise().query("INSERT INTO department SET ?", {
        name: departmentName
    });
    console.log("Department added successfully!");
    prompt();
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    prompt();
});


/*Bonus points

View employees by manager.

View employees by department.

Delete departments, roles, and employees.

View the total utilized budget of a department—in other words, the combined salaries of all employees in that department.Bonus TODO*/

//View employees by manager
async function viewEmployeesByManager() {
    const managers = await connection.promise().query("SELECT * FROM employee WHERE manager_id IS NULL");
    const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { managerId } = await inquirer.prompt([
        {
            type: "list",
            name: "managerId",
            message: "Which manager would you like to view employees for?",
            choices: managerChoices
        }
    ]);
    const employees = await connection.promise().query("SELECT * FROM employee WHERE manager_id = ?", managerId);
    console.table(employees);
    prompt();
}

//View employees by department
async function viewEmployeesByDepartment() {
    const departments = await connection.promise().query("SELECT * FROM department");
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const { departmentId } = await inquirer.prompt([
        {
            type: "list",
            name: "departmentId",
            message: "Which department would you like to view employees for?",
            choices: departmentChoices
        }
    ]);
    const employees = await connection.promise().query("SELECT * FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = ?", departmentId);
    console.table(employees);
    prompt();
}

//Delete departments, roles, and employees
async function deleteDepartment() {
    const departments = await connection.promise().query("SELECT * FROM department");
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const { departmentId } = await inquirer.prompt([
        {
            type: "list",
            name: "departmentId",
            message: "Which department would you like to delete?",
            choices: departmentChoices
        }
    ]);
    await connection.promise().query("DELETE FROM department WHERE id = ?", departmentId);
    console.log("Department deleted successfully!");
    prompt();
}

async function deleteRole() {
    const roles = await connection.promise().query("SELECT * FROM role");
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const { roleId } = await inquirer.prompt([
        {
            type: "list",
            name: "roleId",
            message: "Which role would you like to delete?",
            choices: roleChoices
        }
    ]);
    await connection.promise().query("DELETE FROM role WHERE id = ?", roleId);
    console.log("Role deleted successfully!");
    prompt();
}

//Delete employee
async function deleteEmployee() {
    const employees = await connection.promise().query("SELECT * FROM employee");
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));
    const { employeeId } = await inquirer.prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Which employee would you like to delete?",
            choices: employeeChoices
        }
    ]);
    await connection.promise().query("DELETE FROM employee WHERE id = ?", employeeId);
    console.log("Employee deleted successfully!");
    prompt();
}










//Previous code: delete if not needed??
/*const updateEmployeeRole = () => {
    connection.promise().query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee would you like to update?",
                choices: function () {
                    let employeeArray = [];
                    for (let i = 0; i < res.length; i++) {
                        employeeArray.push(res[i].first_name + " " + res[i].last_name);
                    }
                    return employeeArray;
                }
            }])
        .then((response) => {
            let employeeId;
            for (let i = 0; i < res.length; i++) {
                if (response.employee == res[i].first_name + " " + res[i].last_name) {
                    employeeId = res[i].id;
                }
            }
        })
    })
    
}


// function to add employee
const addNewEmployee = () => {
    connection.promise().query("SELECT * FROM role", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "lastName",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "role",
                message: "What is the employee's role?",
                choices: function () {
                    let roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push(res[i].title);
                    }
                    return roleArray;
                }
            }
        ]).then((response) => {
            let roleId;
            for (let i = 0; i < res.length; i++) {
                if (response.role == res[i].title) {
                    roleId = res[i].id;
                }
            }
            connection.promise().query("INSERT INTO employee SET ?",
                {
                    first_name: response.firstName,
                    last_name: response.lastName,
                    role_id: roleId
                },
                function (err, res) {
                    if (err) throw err;
                    console.log("Employee added successfully!");
                    prompt();
                })
        })
    }
}

// function to update employee role
const addNewRole = () => {
    connection.promise().query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "input",
                name: "roleName",
                message: "What is the name of the role?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary for this role?"
            },
            {
                type: "list",
                name: "department",
                message: "Which department does this role belong to?",
                choices: function () {
                    let departmentArray = [];
                    for (let i = 0; i < res.length; i++) {
                        departmentArray.push(res[i].name);
                    }
                    return departmentArray;
                }
            }
        ]).then((response) => {
            let departmentId;
            for (let i = 0; i < res.length; i++) {
                if (response.department == res[i].name) {
                    departmentId = res[i].id;
                }
            }
            connection.promise().query("INSERT INTO role SET ?",
                {
                    title: response.roleName,
                    salary: response.salary,
                    department_id: departmentId
                },
                function (err, res) {
                    if (err) throw err;
                    console.log("Role added successfully!");
                    prompt();
                })
        })
    })
}

// function to add new department
const addNewDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "What is the name of the department?"
        }
    ]).then((response) => {
        connection.promise().query("INSERT INTO department SET ?",
            {
                name: response.departmentName
            },
            function (err, res) {
                if (err) throw err;
                console.log("Department added successfully!");
                prompt();
            })
    })
} */




