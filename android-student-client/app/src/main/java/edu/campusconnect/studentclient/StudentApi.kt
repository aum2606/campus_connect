package edu.campusconnect.studentclient

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface StudentApi {
    @GET("students") suspend fun listStudents(): List<Student>
    @POST("students") suspend fun createStudent(@Body student: StudentRequest): Student
}
