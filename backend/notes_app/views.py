from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .documents import NoteDocument
NoteDocument.init()

from .models import Label, Note
from .serializers import LabelSerializer, NoteSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
logger = logging.getLogger(__name__)
from utils import ins_logger
from sys import exc_info
from django.db.models import Q
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
        if request.GET.get('label'):
            label = request.GET.get('label')
            pins = []
            if label == 'Notes':
                notes = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), archive_bln = False, active_bln = True, pin_bln = False)
                pins = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), archive_bln = False, active_bln = True, pin_bln = True)
            elif label == 'Archive':
                notes = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), archive_bln = True, active_bln = True, pin_bln = False)
                pins = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), archive_bln = True, active_bln = True, pin_bln = True)
            elif label == 'Trash':
                notes = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), active_bln = False)
            else:
                notes = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), labels__id__contains = request.GET.get('label'), archive_bln = False, active_bln = True, pin_bln = False)
                pins = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), labels__id__contains = request.GET.get('label'), archive_bln = False, active_bln = True, pin_bln = True)
            serializer = NoteSerializer(notes, many=True, context={'request': request})
            serializer_pins = NoteSerializer(pins, many=True, context={'request': request})
            return Response({"success":True, 'details': serializer.data, 'pins': serializer_pins.data}, status=status.HTTP_200_OK)
        else:
            notes = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), archive_bln = False, active_bln = True, pin_bln = False)
            pins = Note.objects.filter(Q(created_by = request.user) | Q(collaborators__icontains = request.user.email), archive_bln = False, active_bln = True, pin_bln = True)
            serializer = NoteSerializer(notes, many=True, context={'request': request})
            serializer_pins = NoteSerializer(pins, many=True, context={'request': request})
            return Response({"success":True, 'details': serializer.data, 'pins': serializer_pins.data}, status=status.HTTP_200_OK)
        

    def post(self, request):
        # import pdb;pdb.set_trace()
        serializer = NoteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success":True, 'details': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"success":False, 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        

    def put(self, request):
        # import pdb;pdb.set_trace()
        note = get_object_or_404(Note, pk=request.data.get('id'))
        serializer = NoteSerializer(note, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            response_data = {
                "success":True,
                "details": serializer.data
            }
            return Response(response_data, status=status.HTTP_200_OK)
        return Response({"success":False, 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        note = get_object_or_404(Note, pk=request.GET.get('pk'))
        note.active_bln = False
        note.save()
        return Response({"success":True, 'details': "Deleted Successfully"}, status=status.HTTP_200_OK)

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
            labels = Label.objects.filter(created_by = request.user).order_by('name')
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

def generate_note_search_query(user_email, label, query):
    # Build the base query with a bool must query for user matching and multi_match for title/description search
    base_query = NoteDocument.search().query(
        "bool",
        must=[
            {
                "bool": {
                    "should": [
                        {"match": {"created_by.email": user_email}},
                        {"match_phrase": {"collaborators": user_email}}
                    ]
                }
            },
            {
                "multi_match": {  # Search query across both title and description
                    "query": query,
                    "fields": ["title", "description"],  # Search in both fields
                    "type": "phrase"  # Match the exact phrase in the query
                }
            }
        ]
    )
    
    # Filter based on label
    if label == 'Notes':
        base_query = base_query.filter("term", active_bln=True)
    elif label == 'Archive':
        base_query = base_query.filter("term", archive_bln=True).filter("term", active_bln=True)
    elif label == 'Trash':
        base_query = base_query.filter("term", active_bln=False)
    else:
        # Handle custom label
        base_query = base_query.filter("nested", path="labels", query={"term": {"labels.name": label}})
    
    return base_query


class NoteSearchAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # import pdb;pdb.set_trace()
        query = request.GET.get('q', '')  # Get the search query from the request
        if query:
            # Get label, default to 'Notes'
            label = request.GET.get('label', 'Notes') or 'Notes'
            search_results = None

            search_results = generate_note_search_query(request.user.email, label, query)
            
            # Convert the search results to a Django queryset
            results = search_results.to_queryset()

            # Filter based on pin and archive flags
            notes = results.filter(pin_bln=False, archive_bln=False)
            pins = results.filter(pin_bln=True)
            archives = results.filter(archive_bln=True)

            # Serialize the results
            serializer_notes = NoteSerializer(notes, many=True, context={'request': request})
            serializer_pins = NoteSerializer(pins, many=True, context={'request': request})
            serializer_archives = NoteSerializer(archives, many=True, context={'request': request})

            return Response({
                "success": True, 
                'notes': serializer_notes.data,
                'pins': serializer_pins.data,
                'archives': serializer_archives.data
            }, status=status.HTTP_200_OK)

        return Response({"success": False, 'details': []}, status=status.HTTP_400_BAD_REQUEST)
