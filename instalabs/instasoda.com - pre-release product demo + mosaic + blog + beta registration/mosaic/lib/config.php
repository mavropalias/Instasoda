<?php
	/*
	$hostname = 'internal-db.s56768.gridserver.com';
	$username = 'db56768_is';
	$password = 'mav711ZX#$4*';
	$dbname = 'db56768_is';
	*/
	
	$hostname = "localhost";
	$username = "root";
	$password = "";
	$dbname = 'instasoda'; 
	$dbh = null;
	try {
	    $dbh = new PDO("mysql:host=$hostname;dbname=$dbname", $username, $password);
	}
	catch(PDOException $e)
	{
	   echo $e->getMessage();
	}
?>