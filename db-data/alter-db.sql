use hoian_travel;

create table if not exists tourism (
	id int not null auto_increment primary key,
    name varchar(255) not null unique
);

alter table tour 
	add column tourism_id int,
    ADD FOREIGN KEY (tourism_id) REFERENCES tourism(id);
    
ALTER TABLE hoian_travel.tour MODIFY additional longtext;
ALTER TABLE hoian_travel.tour MODIFY key_detail longtext;
ALTER TABLE hoian_travel.tour MODIFY advantage longtext;
ALTER TABLE hoian_travel.tour MODIFY important_info longtext;
ALTER TABLE hoian_travel.tour MODIFY cancel_policy longtext;

create table if not exists user(
	id int not null auto_increment primary key,
    name varchar(100),
    username varchar(50) unique,
    password varchar(100)
);

alter table comments add column user_id int,
ADD FOREIGN KEY (user_id) REFERENCES user(id);