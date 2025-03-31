<?php
include_once 'DB.php';
class ManageBD extends DB {
    public function getQueries() {
        $students = $this->connect()->query('SELECT * FROM student');
        $courses = $this->connect()->query('SELECT * FROM course');
        $departments = $this->connect()->query('SELECT * FROM department');
        $end = $this->connect()->query('SELECT * FROM end');
        $instructor = $this->connect()->query('SELECT * FROM instructor');
        $instructor_view = $this->connect()->query('SELECT * FROM instructor_view');
        $profesor = $this->connect()->query('SELECT * FROM profesor');
        $takes = $this->connect()->query('SELECT * FROM takes');
        $taylor_building = $this->connect()->query('SELECT * FROM taylor_building');
        $teaches = $this->connect()->query('SELECT * FROM teaches');

        $queries = array(
            "students" => $students,
            "courses" => $courses,
            "departments" => $departments,
            "end" => $end,
            "instructor" => $instructor,
            "instructor_view" => $instructor_view,
            "profesor" => $profesor,
            "takes" => $takes,
            "taylor_building" => $taylor_building,
            "teaches" => $teaches
        );

        return $queries;
    }
}
?>