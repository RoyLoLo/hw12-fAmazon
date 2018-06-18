-- WARNING!!! the line of code below will clear any exisiting database with that name!!!
DROP DATABASE IF EXISTS famazon_fb;

CREATE DATABASE famazon_db;

USE famazon_db;

CREATE TABLE products(
item_id INT Not Null PRIMARY KEY AUTO_INCREMENT ,
product_mfg VARCHAR(255) Not Null,
product_name VARCHAR(255) Not Null,
department_name VARCHAR(20) Not Null,
price DECIMAL(10,2) Not Null DEFAULT 0,
stock INT Not Null DEFAULT 0

);

DESCRIBE products;

INSERT INTO products (product_mfg, product_name, department_name, price, stock) VALUES
("Apple","Iphone X","Telecom",1000,10), 
("Apple","AirPods","Accessories",175,10), 
("Frito Lays","Flaming Hot Cheetos","Food",1.50,144), 
("Nike","Jordan iv Cement 10","Apparel",450.00,3),
("MonCler","Hoodie-blk-L", "Apparel",600,2),
("CocaCola","20oz Diet Coke","Food",1.75,144),
("Nintendo","Switch Console","Electronics",300,8),
("Bose","QC35","Electronics",300,3),
("DJI","Mavic Pro", "Electronics",1100,5),
("Allagash","Cureaux","Food",25,144);
        
        
SELECT * FROM products;