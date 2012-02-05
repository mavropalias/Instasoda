<?php 
    
       // read parameteres
        $rawJSONString = file_get_contents('php://input');
        //$item = json_decode($rawJSONString);
        
        file_put_contents('notifications.txt', $rawJSONString, FILE_APPEND);
        
        header('Cache-Control: no-cache, must-revalidate');
        header ("Content-Type:text/xml");
        
        
        echo '<?xml version="1.0" encoding="utf-16"?><badge value="7"/>';
?>