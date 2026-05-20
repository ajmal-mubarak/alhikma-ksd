from django.db import models
import os


class Student(models.Model):
    ELIGIBLE = 'eligible'
    NOT_ELIGIBLE = 'not_eligible'
    STATUS_CHOICES = [
        (ELIGIBLE, 'Eligible'),
        (NOT_ELIGIBLE, 'Not Eligible'),
    ]

    name = models.CharField(max_length=200)
    register_number = models.CharField(max_length=20, unique=True)
    image = models.ImageField(upload_to='students/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=NOT_ELIGIBLE)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.register_number} - {self.name}"

    class Meta:
        ordering = ['name']
