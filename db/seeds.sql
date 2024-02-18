INSERT INTO department(name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Direct negotiations");


INSERT INTO role(title, salary, department_id)
VALUES ("Sales Lead", 120000, 1),
       ("Salesperson", 80000, 1),
       ("Lead Engineer", 150000, 2),
       ("Software Engineer", 120000, 2),
       ("Account Manager", 160000, 3),
       ("Accountant", 125000, 3),
       ("Legal Team Leader", 250000, 4),
       ("Lawyer", 190000, 4),
       ("Negotiating Leader", 180000, 5),
       ("Negotiator", 120000, 5);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, NULL),
       ("Mike", "Chan", 2, 1),
       ("Ashley", "Rodriguez", 3, NULL),
       ("Kevin", "Tupik", 4, 3),
       ("Kunal", "Singh", 5, NULL),
       ("Malia", "Brown", 6, 5),
       ("Sarah", "Lourd", 7, NULL),
       ("Tom", "Allen", 8, 7),
       ("Roger", "Zelazny", 9, NULL),
       ("Corwin", "Kori", 10, 9);
