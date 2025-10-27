#!/usr/bin/env python3
"""
Test script to verify AI question generation from PDFs using RAG
"""
import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:8000/api"
EMAIL = "sabyasachi.upadhyay@test.com"  # Replace with your actual test user email
PASSWORD = "testpass123"  # Replace with your actual password

def main():
    print("🧪 Testing AI Question Generation from PDFs\n")
    print("=" * 60)
    
    # Step 1: Login
    print("\n1️⃣  Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        sys.exit(1)
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Login successful!")
    
    # Step 2: Create Assessment
    print("\n2️⃣  Creating assessment (this will trigger RAG + LLM question generation)...")
    print("   📖 This should:")
    print("      - Load content from your PDFs using RAG")
    print("      - Generate questions using Groq/OpenAI")
    print("      - Save questions to database\n")
    
    assessment_data = {
        "subject": "history",
        "topic": "Medieval India",
        "difficulty_level": "medium"
    }
    
    print(f"   Request: {json.dumps(assessment_data, indent=2)}")
    print("\n   ⏳ Generating questions (this may take 10-30 seconds)...")
    
    create_response = requests.post(
        f"{BASE_URL}/assessments/",
        headers=headers,
        json=assessment_data
    )
    
    if create_response.status_code not in [200, 201]:
        print(f"\n❌ Assessment creation failed!")
        print(f"Status: {create_response.status_code}")
        print(f"Error: {create_response.text}")
        sys.exit(1)
    
    assessment = create_response.json()
    print(f"\n✅ Assessment created successfully!")
    print(f"   ID: {assessment['id']}")
    print(f"   Subject: {assessment['subject']}")
    print(f"   Topic: {assessment['topic']}")
    print(f"   Questions generated: {len(assessment['questions'])}")
    
    # Step 3: Analyze Questions
    print("\n3️⃣  Analyzing generated questions...\n")
    print("=" * 60)
    
    for idx, question in enumerate(assessment['questions'][:3], 1):  # Show first 3
        print(f"\n📝 Question {idx}:")
        print(f"   Type: {question['type']}")
        print(f"   Text: {question['question_text'][:100]}...")
        
        if question['type'] == 'mcq' and question.get('options'):
            print(f"   Options: {len(question['options'])} choices")
            for key, value in list(question['options'].items())[:2]:
                print(f"      {key}: {value[:50]}...")
        
        if question.get('source_reference'):
            print(f"   Source: {question['source_reference']}")
    
    if len(assessment['questions']) > 3:
        print(f"\n   ... and {len(assessment['questions']) - 3} more questions")
    
    # Step 4: Verification
    print("\n\n4️⃣  Verification Results:")
    print("=" * 60)
    
    ai_generated = any(
        q.get('source_reference') and 'NCERT' in str(q.get('source_reference'))
        for q in assessment['questions']
    )
    
    has_varied_questions = len(set(q['question_text'] for q in assessment['questions'])) > 1
    
    if ai_generated:
        print("✅ Questions appear to be AI-generated from PDFs")
        print("   (Source references indicate NCERT content)")
    else:
        print("⚠️  Questions may be using fallback/sample questions")
        print("   (Check backend logs for RAG/LLM errors)")
    
    if has_varied_questions:
        print("✅ Questions are varied and unique")
    else:
        print("⚠️  Questions appear to be duplicates")
    
    print("\n" + "=" * 60)
    print("✅ Test completed!")
    print(f"\n💡 View full assessment at: http://localhost:3000/assessments/{assessment['id']}/take")
    print("\n📋 To see backend logs:")
    print("   tail -f /tmp/backend.log | grep -i 'rag\\|question\\|groq'")

if __name__ == "__main__":
    main()

