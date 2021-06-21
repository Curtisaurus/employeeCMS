USE employees_DB;

INSERT INTO department (name)
VALUES ("Sales"), ("Engineering"), ("Finance"), ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES
    ("Sales Lead", 100000, 1),
    ("Salesperson", 80000, 1),
    ("Lead Engineer", 150000, 2),
    ("Software Engineer", 120000, 2),
    ("Accountant", 125000, 3),
    ("Legal Team Lead", 250000, 4),
    ("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Aaron", "Apple", 1, null),
    ("Benny", "Banana", 1, 1),
    ("Carrie", "Cherry", 2, null),
    ("Doug", "Durian", 2, 3),
    ("Erin", "Elderberry", 2, 3),
    ("Fiona", "Fruit", 3, null),
    ("Gary", "Grape", 4, null),
    ("Howie", "Honeydew", 4, 7),
    ("Irene", "Isoutoforder", 1, 1);
