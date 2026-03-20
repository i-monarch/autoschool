from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'teacher'


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsPaid(BasePermission):
    message = 'Потрібна оплата для доступу до цього контенту.'

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_paid
