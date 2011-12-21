<?php
try {
    //connect to database
    $host = "external-db.s56768.gridserver.com";
    $port = 3306;
    $username = "db56768_is";
    $password = "mav711ZX#$4*";
    $database = "db56768_is";
    
    $dsn = "mysql:host=$host;port=$port;dbname=$database";
    $DB = new PDO($dsn, $username, $password);
    
    $DB->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );  
} catch(PDOException $e) {  
    echo "Error";  
    file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);  
}
?>