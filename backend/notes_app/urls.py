from django.urls import path
from .views import LabelsAPI, NotesAPI

urlpatterns = [
    path('', NotesAPI.as_view(), name='notes_api'),
    path('labels', LabelsAPI.as_view(), name='labels_api')
]