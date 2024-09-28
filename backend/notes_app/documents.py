from django_elasticsearch_dsl import Document, Index, fields
from .models import Note

# Define the Elasticsearch index
note_index = Index('notes')  # Name of the index

note_index.settings(
    number_of_replicas=0,
    analysis={
        "filter": {
            "edge_ngram_filter": {
                "type": "edge_ngram",
                "min_gram": 1,
                "max_gram": 20
            }
        },
        "analyzer": {
            "edge_ngram_analyzer": {
                "type": "custom",
                "tokenizer": "standard",
                "filter": [
                    "lowercase",
                    "edge_ngram_filter"
                ]
            },
            "standard_analyzer": {  # Use standard analyzer for whole-query search
                "type": "standard"
            }
        }
    }
)

@note_index.doc_type
class NoteDocument(Document):
    title = fields.TextField(
        analyzer="edge_ngram_analyzer",  # Partial matching for indexing
        search_analyzer="standard_analyzer"  # Full query matching for search
    )
    description = fields.TextField(
        analyzer="edge_ngram_analyzer",  # Partial matching for indexing
        search_analyzer="standard_analyzer"  # Full query matching for search
    )
    collaborators = fields.TextField()
    labels = fields.NestedField(
        properties={
            'id': fields.IntegerField(),
            'name': fields.TextField(),
        }
    )
    created_by = fields.ObjectField(
        properties={
            'id': fields.IntegerField(),
            'username': fields.TextField(),
            'email': fields.TextField(),
        }
    )
    updated_by = fields.ObjectField(
        properties={
            'id': fields.IntegerField(),
            'username': fields.TextField(),
            'email': fields.TextField(),
        }
    )
    active_bln = fields.BooleanField()

    class Django:
        model = Note  # The model associated with this Document
