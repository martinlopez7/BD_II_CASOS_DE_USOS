<?php
include_once 'DB.php';
class ManageBD extends DB{
  public function getQueries(){

    $course = $this->connect()->query('
    SELECT * FROM course');
    $takes = $this->connect()->query('
    SELECT * FROM takes');
    $sum = $this->connect()->query('
    SELECT DISTINCT SUM(credits) as sum FROM course c INNER JOIN takes t WHERE c.course_id = t.course_id COLLATE utf8mb4_unicode_ci');
    
 
    
    $queries = array (  
        "sum"=>$sum,
        "course"=>$course,
        "takes"=>$takes
        
    );
    
        return $queries;
    
    }
}
?>