create database grocery
use grocery

CREATE TABLE Suppliers (
    supplier_id INT PRIMARY KEY IDENTITY(1,1),
    company_name VARCHAR(255),
    phone_number VARCHAR(20) unique,
    representative_name VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE Products (
    product_id INT PRIMARY KEY IDENTITY(1,1),
    product_name VARCHAR(255),
    price DECIMAL(10, 2),
    minimum_quantity INT,
    supplier_id INT,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id)
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    order_date DATE,
    status VARCHAR(50),
    supplier_id INT,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id),
	Total_Price DECIMAL(10,2) DEFAULT 0,
);

CREATE TABLE OrderDetails (
    order_detail_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);


INSERT INTO Suppliers (company_name, phone_number, representative_name, email) VALUES
('�����', '050-1234567', '���� ���', 'itzhak@tnuva.co.il'),
('������', '052-9876543', '��� ���', 'rachel@strauss.co.il'),
('����-����', '054-1122334', '��� ����', 'david@cocacola.co.il'),
('����', '053-5556666', '��� �����', 'sara@osem.co.il'),
('�����', '055-7778888', '��� ���', 'moshe@prigat.co.il');

INSERT INTO Products (product_name, price, minimum_quantity, supplier_id) VALUES
('��� 3%', 7.50, 6, 1),
('������ ���', 4.20, 10, 1),
('������ ���', 6.80, 5, 2),
('�����', 3.50, 12, 2),
('����', 8.00, 6, 3),
('������', 7.50, 6, 3),
('����� ����', 5.50, 8, 4),
('����', 4.00, 10, 4),
('��� ������', 9.00, 5, 5),
('��� �����', 10.00, 5, 5);

INSERT INTO Orders (order_date, status, supplier_id) VALUES
('2023-10-26', '����', 1),
('2023-10-25', '������', 2),
('2023-10-24', '������', 3),
('2023-10-27', '����', 4),
('2023-10-28', '������', 5);

INSERT INTO OrderDetails (order_id, product_id, quantity) VALUES
(1, 1, 12),
(1, 2, 20),
(2, 3, 10),
(2, 4, 24),
(3, 5, 12),
(3, 6, 12),
(4, 7, 15),
(4, 8, 20),
(5, 9, 10),
(5, 10, 10);