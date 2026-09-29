package edu.campusconnect.studentclient

data class Student(val id: String? = null, val name: String, val email: String, val course: String, val semester: Int)

data class StudentRequest(val name: String, val email: String, val course: String, val semester: Int)
