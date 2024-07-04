from django.urls import path
from .views import NotesAPI

urlpatterns = [
    path('', NotesAPI.as_view(), name='notes_api')
]