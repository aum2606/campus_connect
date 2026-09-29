package edu.campusconnect.studentclient

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MainActivity : AppCompatActivity() {
    private val api = Retrofit.Builder().baseUrl(API_BASE_URL).addConverterFactory(GsonConverterFactory.create()).build().create(StudentApi::class.java)
    private val adapter = StudentAdapter()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        findViewById<RecyclerView>(R.id.studentList).apply { layoutManager = LinearLayoutManager(this@MainActivity); adapter = this@MainActivity.adapter }
        findViewById<Button>(R.id.addStudent).setOnClickListener { createStudent() }
        loadStudents()
    }

    private fun loadStudents() = lifecycleScope.launch {
        try { adapter.submitList(api.listStudents()) }
        catch (error: Exception) { Toast.makeText(this@MainActivity, errorMessage(error), Toast.LENGTH_SHORT).show() }
    }

    private fun createStudent() = lifecycleScope.launch {
        val name = findViewById<EditText>(R.id.name).text.toString()
        val email = findViewById<EditText>(R.id.email).text.toString()
        val course = findViewById<EditText>(R.id.course).text.toString()
        val semester = findViewById<EditText>(R.id.semester).text.toString().toIntOrNull() ?: 0
        if (name.isBlank() || !email.contains("@") || course.isBlank() || semester < 1) { Toast.makeText(this@MainActivity, "Validation error", Toast.LENGTH_SHORT).show(); return@launch }
        try { api.createStudent(StudentRequest(name, email, course, semester)); Toast.makeText(this@MainActivity, "Student added", Toast.LENGTH_SHORT).show(); loadStudents() }
        catch (error: Exception) { Toast.makeText(this@MainActivity, errorMessage(error), Toast.LENGTH_SHORT).show() }
    }

    private fun errorMessage(error: Exception) = when ((error as? HttpException)?.code()) {
        400 -> "Validation error"
        404 -> "Student not found"
        else -> "Something went wrong"
    }
}
