from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Label, Note
from .serializers import LabelSerializer, NoteSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
logger = logging.getLogger(__name__)
from utils import ins_logger
from sys import exc_info

# Create your views here.

class NotesAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        # import pdb;pdb.set_trace()
        if pk:
            note = get_object_or_404(Note, pk=pk)
            serializer = NoteSerializer(note)
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_200_OK)
        else:
            notes = Note.objects.filter(created_by = request.user)
            serializer = NoteSerializer(notes, many=True)
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_200_OK)
        

    def post(self, request):
        import pdb;pdb.set_trace()
        serializer = NoteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"success":False, 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        

    def put(self, request):
        note = get_object_or_404(Note, pk=request.data.get('id'))
        serializer = NoteSerializer(note, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_200_OK)
        return Response({"success":False, 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        note = get_object_or_404(Note, pk=request.data.get('id'))
        note.delete()
        return Response({"success":True, 'details': "Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT)

class LabelsAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        # import pdb;pdb.set_trace()
        if pk:
            label = get_object_or_404(Label, pk=pk)
            serializer = LabelSerializer(label)
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_200_OK)
        else:
            labels = Label.objects.filter(created_by = request.user)
            serializer = LabelSerializer(labels, many=True)
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_200_OK)
        

    def post(self, request):
        # import pdb;pdb.set_trace()
        serializer = LabelSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            labels = Label.objects.filter(created_by = request.user)
            serializer = LabelSerializer(labels, many=True)
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"success":False, 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        

    def put(self, request):
        # import pdb;pdb.set_trace()
        label = get_object_or_404(Label, pk=request.data.get('id'))
        serializer = LabelSerializer(label, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_200_OK)
        return Response({"success":False, 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        label = get_object_or_404(Label, pk=request.GET.get('pk'))
        label.delete()
        return Response({"success":True, 'details': "Deleted Successfully"}, status=status.HTTP_200_OK)
       