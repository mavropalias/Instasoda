<?php
    try {
        //connect to database
        $host = "external-db.s56768.gridserver.com";
        $port = 3306;
        $username = "db56768_is";
        $password = "xxx"; // please insert proper DB password
        $database = "db56768_is";
        
        $dsn = "mysql:host=$host;port=$port;dbname=$database";
        $DB = new PDO($dsn, $username, $password);
        
        // PDO Settings
        $DB->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION ); // throw exceptions
    } catch(PDOException $e) {
        header( 'HTTP/1.1 400: BAD REQUEST' );
        echo json_encode(array("status"=>"Error 100")); 
        file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);  
    }
    
    session_start();
    
    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');
    
    // cors shit
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Credentials: true ");
    header("Access-Control-Allow-Methods: OPTIONS, GET, POST");
    header("Access-Control-Allow-Headers: Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control");


    // debug
    //ob_start();
    //print_r( $_SERVER );
    //$log = ob_get_clean();
    //file_put_contents('debug.txt', $log, FILE_APPEND);
?>