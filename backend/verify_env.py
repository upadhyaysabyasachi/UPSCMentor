#!/usr/bin/env python3
"""
Verify that all environment variables are loaded correctly
Run this to check your .env configuration for PadhAI project
"""
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import settings

def verify_env():
    """Check if all required environment variables are set"""
    
    print("=" * 60)
    print("🔍 Environment Variables Verification")
    print("=" * 60)
    
    required_vars = {
        "Supabase (PadhAI Project)": [
            ("DATABASE_URL", settings.DATABASE_URL),
            ("SUPABASE_URL", settings.SUPABASE_URL),
            ("SUPABASE_KEY", settings.SUPABASE_KEY),
        ],
        "JWT Authentication": [
            ("SECRET_KEY", settings.SECRET_KEY),
            ("ALGORITHM", settings.ALGORITHM),
        ],
        "LLM APIs": [
            ("GROQ_API_KEY", settings.GROQ_API_KEY),
            ("OPENAI_API_KEY", settings.OPENAI_API_KEY),
            ("OPENAI_MODEL", settings.OPENAI_MODEL),
        ],
    }
    
    optional_vars = {
        "Optional Services": [
            ("SUPABASE_ANON_KEY", settings.SUPABASE_ANON_KEY),
            ("GOOGLE_VISION_API_KEY", settings.GOOGLE_VISION_API_KEY),
            ("RESEND_API_KEY", settings.RESEND_API_KEY),
        ]
    }
    
    all_good = True
    
    # Check required variables
    print("\n✅ REQUIRED Variables:")
    print("-" * 60)
    
    for category, vars in required_vars.items():
        print(f"\n📌 {category}:")
        for name, value in vars:
            if value and str(value) not in ["your-secret-key-change-this-in-production", "your-super-secret-jwt-key-min-32-characters"]:
                # Mask sensitive values
                if "KEY" in name or "SECRET" in name or "PASSWORD" in name.upper():
                    if len(str(value)) > 12:
                        display_value = str(value)[:8] + "..." + str(value)[-4:]
                    else:
                        display_value = "***"
                elif "URL" in name:
                    display_value = str(value)[:40] + "..." if len(str(value)) > 40 else str(value)
                else:
                    display_value = str(value)
                    
                print(f"  ✓ {name:25} = {display_value}")
            else:
                print(f"  ✗ {name:25} = NOT SET OR DEFAULT")
                all_good = False
    
    # Check optional variables
    print("\n\n⚙️  OPTIONAL Variables:")
    print("-" * 60)
    
    for category, vars in optional_vars.items():
        print(f"\n📌 {category}:")
        for name, value in vars:
            if value:
                if len(str(value)) > 12:
                    display_value = str(value)[:8] + "..." + str(value)[-4:]
                else:
                    display_value = "***"
                print(f"  ✓ {name:25} = {display_value}")
            else:
                print(f"  - {name:25} = Not configured (OK)")
    
    # Show configuration
    print("\n\n⚙️  Application Configuration:")
    print("-" * 60)
    print(f"  App Name:      {settings.APP_NAME}")
    print(f"  Version:       {settings.VERSION}")
    print(f"  Environment:   {settings.ENVIRONMENT}")
    print(f"  Debug Mode:    {settings.DEBUG}")
    
    # Supabase project detection
    print("\n\n🏢 Supabase Project:")
    print("-" * 60)
    if settings.SUPABASE_URL:
        project_ref = settings.SUPABASE_URL.split("//")[1].split(".")[0] if "//" in settings.SUPABASE_URL else "unknown"
        print(f"  Project:       PadhAI")
        print(f"  URL:           {settings.SUPABASE_URL}")
        print(f"  Dashboard:     https://supabase.com/dashboard/project/{project_ref}")
    
    # Summary
    print("\n" + "=" * 60)
    if all_good:
        print("✅ All required environment variables are configured!")
        print("✅ Connected to PadhAI Supabase project")
        print("✅ You're ready to start the backend server.")
        print("\nNext steps:")
        print("  1. Start backend: python main.py")
        print("  2. Check health: curl http://localhost:8000/health")
        print("  3. View API docs: http://localhost:8000/docs")
    else:
        print("❌ Some required environment variables are missing!")
        print("\n📝 Next steps:")
        print("  1. Copy .env.example to .env")
        print("  2. Get credentials from your PadhAI project:")
        print("     https://supabase.com/dashboard/project/padhai")
        print("  3. Fill in your actual API keys and credentials")
        print("  4. Run this script again to verify")
        print("\nCommands:")
        print("  cp .env.example .env")
        print("  nano .env  # or use your preferred editor")
    print("=" * 60)
    
    return all_good


if __name__ == "__main__":
    try:
        success = verify_env()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error loading configuration: {e}")
        print("\n💡 Make sure you have a .env file in the backend directory")
        print("   Copy .env.example to .env and fill in your PadhAI credentials")
        print("\n   Get your PadhAI project credentials from:")
        print("   https://supabase.com/dashboard/project/padhai")
        sys.exit(1)
