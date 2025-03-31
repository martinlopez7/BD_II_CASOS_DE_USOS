<?php
include_once 'DB.php';
class ManageBD extends DB{
  public function getQueries(){

    $course = $this->connect()->query('
    SELECT * FROM course');
    $reunionnatural = $this->connect()->query('
    SELECT DISTINCT c.*, t.* FROM course AS c NATURAL JOIN takes AS t');
    $instructors = $this->connect()->query("
    SELECT * FROM 
        (SELECT i.* FROM instructor i WHERE salary > 90000) AS set_1 
    UNION 
    SELECT * FROM 
        (SELECT i.* FROM instructor i WHERE i.dept_name = 'Marketing' OR i.dept_name = 'English') AS set_2
    ");
    $json = $this->connect()->query('
    SELECT * FROM json_all WHERE id=3');
    $reunionnatural2 = $this->connect()->query('
    SELECT DISTINCT c.*, t.* FROM course AS c NATURAL JOIN takes AS t');

    
 
    
    $queries = array (  
        "course"=>$course,
        "reunionnatural"=>$reunionnatural,
        "instructors"=>$instructors,
        "json"=>$json,
        "reunionnatural2"=>$reunionnatural2
    );
    
        return $queries;
    
    }
}
?>