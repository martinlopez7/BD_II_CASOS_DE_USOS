<?php
include_once 'DB.php';
class ManageBD extends DB {
    public function getQueries() {
        $students = $this->connect()->query('SELECT * FROM student');
        $instructor = $this->connect()->query('SELECT * FROM instructor');
        $advisor = $this->connect()->query('SELECT * FROM advisor');

        $queries = array(
            "students" => $students,
            "instructor" => $instructor,
            "advisor" => $advisor,
        );

        return $queries;
    }
}
?>