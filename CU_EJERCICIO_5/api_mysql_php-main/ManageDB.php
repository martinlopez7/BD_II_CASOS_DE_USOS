<?php
include_once 'DB.php';
class ManageBD extends DB{
  public function getQueries(){

	$json= $this->connect()->query('SELECT * FROM student_json');
	$queries = array (
		"json"=>$json
	);
	
		return $queries;
	
	}
}
?>