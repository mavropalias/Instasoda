<?php
require('config.php');

$ip = $_SERVER['REMOTE_ADDR'];
$isStory = $_POST['story'];
$isNickname = $_POST['nickname'];
$isTitle = "story title";

// query
$sql = "INSERT INTO posts (author, content, title) VALUES (:author, :content, :title)";
$q = $dbh->prepare($sql);
$q->execute(array(':author'=>$isNickname,
                  ':content'=>$isStory,
									':title'=>$isTitle));


echo json_encode(array("status"=>"alright"));
?>