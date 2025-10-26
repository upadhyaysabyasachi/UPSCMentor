#!/usr/bin/env python3
"""
Test database connection to Supabase
Run this script after updating your DATABASE_URL in .env
"""
from dotenv import load_dotenv
import os
import sys
from sqlalchemy import create_engine, text

def test_connection():
    # Load environment variables
    load_dotenv(override=True)
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in .env file")
        sys.exit(1)

    # Mask password for display
    if '@' in database_url:
        parts = database_url.split('@')
        user_pass = parts[0].split('://')[-1]
        if ':' in user_pass:
            user = user_pass.split(':')[0]
            masked_url = f"postgresql://{user}:***@{parts[1]}"
        else:
            masked_url = database_url
    else:
        masked_url = database_url

    print("=" * 80)
    print("DATABASE CONNECTION TEST")
    print("=" * 80)
    print(f"\nConnection URL: {masked_url}")
    print("\nTesting connection...")

    try:
        # Create engine with timeout
        engine = create_engine(
            database_url,
            connect_args={'connect_timeout': 10}
        )

        # Test connection
        with engine.connect() as conn:
            # Get PostgreSQL version
            result = conn.execute(text('SELECT version();'))
            version = result.fetchone()[0]

            # Get current database and user
            result2 = conn.execute(text('SELECT current_database(), current_user;'))
            db_name, db_user = result2.fetchone()

            # Check if pgvector extension exists
            result3 = conn.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM pg_extension WHERE extname = 'vector'
                );
            """))
            has_pgvector = result3.fetchone()[0]

            print("\n" + "=" * 80)
            print("✅ SUCCESS! Database connection established!")
            print("=" * 80)
            print(f"\n📊 Connection Details:")
            print(f"  • Database: {db_name}")
            print(f"  • User: {db_user}")
            print(f"  • PostgreSQL: {version.split(' on ')[0]}")
            print(f"  • pgvector extension: {'✅ Installed' if has_pgvector else '❌ Not installed'}")

            if not has_pgvector:
                print("\n⚠️  WARNING: pgvector extension is not installed!")
                print("   Run this SQL in Supabase SQL Editor:")
                print("   CREATE EXTENSION IF NOT EXISTS vector;")

            print("\n" + "=" * 80)
            return True

    except Exception as e:
        print("\n" + "=" * 80)
        print("❌ CONNECTION FAILED!")
        print("=" * 80)
        print(f"\nError Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")

        # Provide helpful error messages
        error_msg = str(e).lower()
        print("\n💡 Troubleshooting Tips:")

        if 'could not translate host name' in error_msg or 'nodename' in error_msg:
            print("  • DNS resolution failed - check your internet connection")
            print("  • Verify the hostname in DATABASE_URL is correct")
            print("  • Try using 'aws-0-ap-south-1.pooler.supabase.com' as hostname")

        elif 'tenant or user not found' in error_msg:
            print("  • Username format is incorrect")
            print("  • Should be: postgres.[PROJECT-REF] (e.g., postgres.pwvudqwxijxpiajnrjyi)")
            print("  • Get correct connection string from Supabase Dashboard")
            print("  • Go to: Settings → Database → Connection string")

        elif 'password authentication failed' in error_msg:
            print("  • Password is incorrect")
            print("  • Verify your database password in Supabase dashboard")
            print("  • Password should NOT contain URL-encoded characters in .env")

        elif 'timeout' in error_msg or 'timed out' in error_msg:
            print("  • Connection timeout - check firewall/network settings")
            print("  • Verify you can reach: aws-0-ap-south-1.pooler.supabase.com")
            print("  • Try a different network or disable VPN")

        else:
            print("  • Check your DATABASE_URL format")
            print("  • Format: postgresql://USER:PASS@HOST:PORT/DATABASE")
            print("  • Refer to Supabase documentation for connection strings")

        print("\n" + "=" * 80)
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
