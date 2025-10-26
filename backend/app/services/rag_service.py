"""
RAG Service for processing and querying NCERT documents with Supabase vector storage
"""
import os
from typing import List, Dict, Optional
from pathlib import Path
import logging

from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Settings,
    Document
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.supabase import SupabaseVectorStore
from sqlalchemy import create_engine

from config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """Service for managing document embeddings and retrieval with Supabase"""
    
    def __init__(self):
        # Get data directory - check both relative and absolute paths
        backend_dir = Path(__file__).parent.parent.parent  # backend/ directory
        self.data_dir = backend_dir.parent / "data"  # RAG/data directory
        self.index_dir = backend_dir / "storage"  # backend/storage directory
        self.index = None
        self.query_engine = None
        self.vector_store = None
        
        logger.info(f"RAG Service initialized with data_dir: {self.data_dir}")
        
        # Configure LlamaIndex settings
        Settings.embed_model = OpenAIEmbedding(
            api_key=settings.OPENAI_API_KEY,
            model="text-embedding-3-small"
        )
        Settings.chunk_size = 1024
        Settings.chunk_overlap = 200
        
    async def initialize(self):
        """Initialize or load the vector index with Supabase"""
        try:
            # Initialize Supabase vector store
            if settings.SUPABASE_URL and settings.SUPABASE_KEY:
                logger.info("Initializing Supabase vector store...")
                
                # Create vector store with Supabase
                self.vector_store = SupabaseVectorStore(
                    postgres_connection_string=settings.DATABASE_URL,
                    collection_name="document_embeddings",
                    dimension=1536  # OpenAI embedding dimension
                )
                
                # Check if we need to create index
                if self._should_create_index():
                    logger.info("Creating new vector index from documents...")
                    await self.create_index()
                else:
                    logger.info("Loading existing vector index...")
                    storage_context = StorageContext.from_defaults(
                        vector_store=self.vector_store
                    )
                    self.index = VectorStoreIndex.from_vector_store(
                        self.vector_store,
                        storage_context=storage_context
                    )
            else:
                # Fallback to local storage
                logger.warning("Supabase not configured, using local storage")
                if self.index_dir.exists() and (self.index_dir / "docstore.json").exists():
                    logger.info("Loading existing local vector index...")
                    storage_context = StorageContext.from_defaults(
                        persist_dir=str(self.index_dir)
                    )
                    self.index = load_index_from_storage(storage_context)
                else:
                    logger.info("Creating new local vector index...")
                    await self.create_index()
            
            # Create query engine
            self.query_engine = self.index.as_query_engine(
                similarity_top_k=5,
                response_mode="tree_summarize"
            )
            logger.info("Query engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing RAG service: {e}")
            raise
    
    def _should_create_index(self) -> bool:
        """Check if we should create a new index"""
        # Check if documents exist in vector store
        # For now, we'll check if local index exists
        return not (self.index_dir.exists() and (self.index_dir / "docstore.json").exists())
    
    async def create_index(self):
        """Create vector index from documents"""
        try:
            if not self.data_dir.exists():
                logger.warning(f"Data directory not found: {self.data_dir}")
                logger.info("Creating sample index...")
                # Create a sample document for testing
                documents = [
                    Document(
                        text="This is a sample NCERT document about Ancient India. The Indus Valley Civilization was one of the world's earliest urban civilizations.",
                        metadata={"subject": "history", "source": "sample"}
                    )
                ]
            else:
                logger.info(f"Reading documents from {self.data_dir}")
                
                # Load documents with metadata
                documents = []
                for subject_dir in self.data_dir.iterdir():
                    if subject_dir.is_dir():
                        subject = subject_dir.name
                        logger.info(f"Processing {subject} documents...")
                        
                        try:
                            reader = SimpleDirectoryReader(
                                input_dir=str(subject_dir),
                                required_exts=[".pdf"],
                                recursive=True
                            )
                            subject_docs = reader.load_data()
                            
                            # Add metadata to documents
                            for doc in subject_docs:
                                doc.metadata["subject"] = subject
                                doc.metadata["source"] = doc.metadata.get("file_name", "unknown")
                            
                            documents.extend(subject_docs)
                            logger.info(f"Loaded {len(subject_docs)} documents from {subject}")
                        except Exception as e:
                            logger.error(f"Error loading {subject} documents: {e}")
                            continue
            
            if not documents:
                raise ValueError("No documents found to index")
            
            logger.info(f"Creating index from {len(documents)} total documents...")
            
            # Create text splitter
            text_splitter = SentenceSplitter(
                chunk_size=1024,
                chunk_overlap=200
            )
            
            # Create storage context
            if self.vector_store:
                storage_context = StorageContext.from_defaults(
                    vector_store=self.vector_store
                )
            else:
                storage_context = None
            
            # Create index
            self.index = VectorStoreIndex.from_documents(
                documents,
                transformations=[text_splitter],
                storage_context=storage_context,
                show_progress=True
            )
            
            # Persist index locally as backup
            if not self.vector_store:
                self.index_dir.mkdir(exist_ok=True)
                self.index.storage_context.persist(persist_dir=str(self.index_dir))
                logger.info(f"Index created and persisted locally to {self.index_dir}")
            else:
                logger.info("Index created and stored in Supabase")
            
        except Exception as e:
            logger.error(f"Error creating index: {e}")
            raise
    
    async def query(
        self,
        query: str,
        subject: Optional[str] = None,
        topic: Optional[str] = None,
        top_k: int = 5
    ) -> Dict:
        """
        Query the RAG system for relevant context
        
        Args:
            query: The question or query text
            subject: Optional subject filter
            topic: Optional topic filter
            top_k: Number of results to return
            
        Returns:
            Dictionary with response and source nodes
        """
        try:
            if not self.query_engine:
                await self.initialize()
            
            # Add filters to query if specified
            if subject:
                query = f"Subject: {subject}. {query}"
            if topic:
                query = f"Topic: {topic}. {query}"
            
            logger.info(f"Querying: {query[:100]}...")
            response = self.query_engine.query(query)
            
            # Extract source nodes
            sources = []
            if hasattr(response, 'source_nodes'):
                for node in response.source_nodes[:top_k]:
                    sources.append({
                        "text": node.text[:500],  # Truncate for response
                        "score": node.score if hasattr(node, 'score') else None,
                        "metadata": node.metadata if hasattr(node, 'metadata') else {}
                    })
            
            return {
                "response": str(response),
                "sources": sources,
                "query": query
            }
            
        except Exception as e:
            logger.error(f"Error querying RAG system: {e}")
            return {
                "response": "",
                "sources": [],
                "error": str(e)
            }
    
    async def get_context_for_evaluation(
        self,
        question: str,
        subject: str,
        topic: str
    ) -> str:
        """
        Get relevant context from NCERT for answer evaluation
        
        Args:
            question: The question text
            subject: Subject name
            topic: Topic name
            
        Returns:
            Relevant context text
        """
        result = await self.query(
            query=f"Question: {question}. Provide relevant context and key concepts.",
            subject=subject,
            topic=topic,
            top_k=3
        )
        
        # Combine response and sources
        context_parts = [result["response"]]
        for source in result["sources"]:
            context_parts.append(f"\n\nSource: {source['metadata'].get('source', 'Unknown')}")
            context_parts.append(source["text"])
        
        return "\n".join(context_parts)
    
    async def get_recommendations(
        self,
        concept_gaps: List[str],
        subject: str
    ) -> Dict:
        """
        Get NCERT chapter recommendations for concept gaps
        
        Args:
            concept_gaps: List of concepts the student needs to work on
            subject: Subject name
            
        Returns:
            Dictionary with NCERT recommendations
        """
        recommendations = []
        
        for concept in concept_gaps:
            result = await self.query(
                query=f"Which NCERT chapter covers {concept}? Provide chapter name, pages, and key topics.",
                subject=subject,
                top_k=2
            )
            
            if result["sources"]:
                rec = {
                    "concept": concept,
                    "recommendations": result["response"],
                    "sources": result["sources"]
                }
                recommendations.append(rec)
        
        return {
            "recommendations": recommendations,
            "subject": subject
        }


# Global RAG service instance
rag_service = RAGService()
