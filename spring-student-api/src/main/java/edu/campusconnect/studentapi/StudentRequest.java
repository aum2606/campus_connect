package edu.campusconnect.studentapi;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record StudentRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    @NotBlank String course,
    @Min(1) int semester
) { }
