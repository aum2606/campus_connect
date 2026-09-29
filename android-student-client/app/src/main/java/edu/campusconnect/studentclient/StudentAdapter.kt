package edu.campusconnect.studentclient

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class StudentAdapter : RecyclerView.Adapter<StudentAdapter.ViewHolder>() {
    private var students = emptyList<Student>()
    fun submitList(updatedStudents: List<Student>) { students = updatedStudents; notifyDataSetChanged() }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.item_student, parent, false) as TextView)
    override fun getItemCount() = students.size
    override fun onBindViewHolder(holder: ViewHolder, position: Int) { holder.text.text = "${students[position].name} - ${students[position].course}" }
    class ViewHolder(val text: TextView) : RecyclerView.ViewHolder(text)
}
