# Walcarius | Administration databases

## Requirements
- `MySQL` version 5.7
- `MongoDB` version 4.x (minimum)
- `Redis` version 5.0

## Installation
### Mysql
- Install MySQL by following the instructions found here : [Installation guide](https://dev.mysql.com/doc/refman/5.7/en/installing.html).
- MySQL should be used with the following modes : NO_AUTO_CREATE_USER and NO_ENGINE_SUBSTITUTION. Learn how to change them and what they do [here](https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html#sql-mode-setting).
- Execute the script [database.sql](./database.sql) to init the database structure. You might want to change the schema name in the first lines of the script. Default used is `walcarius`.
- Execute the script [insert_data.sql](./insert_data.sql) to insert the required base data for this application. You might want to change the used schema in the first line of the script. Default used is `walcarius`.

Database script for Devis only can be found in [db_devis.sql](./devis/db_devis.sql), and related data in [insert_devis.sql](./devis/insert_devis.sql).

### MongoDB
- Install MongoDB by following the instructions found here : [Installation guide](https://docs.mongodb.com/manual/installation/).


### Redis
- Install Redis by following the instructions found here : [Installation guide](https://redis.io/topics/quickstart).

## Usage
### Mysql
Use the following configs in the `.env` file
```
WAL_MYSQL_HOST : Host of your MySQL server
WAL_MYSQL_PORT : Port of your MySQL service
WAL_MYSQL_USER : User for MySQL
WAL_MYSQL_PASSWORD : Password of selected user 
WAL_MYSQL_DBNAME : Name of the database. Should be walcarius if SQL script were used by default
```

### MongoDB
Use the following configs in the `.env` file
```
WAL_MONGO_URL : Host of your MongoDB server
WAL_MONGO_PORT : Port of your MongoDB service
WAL_MONGO_DBNAME : Name of the database in MongoDB
 ```

### Redis
Use the following configs in the `.env` file
```
WAL_REDIS_PORT : Port of your Redis server
WAL_REDIS_HOST : Host of your Redis server
WAL_REDIS_DB : Database number of your Redis server. Must be lower than the number set in redis configuration (0 should always be okay)
 ```