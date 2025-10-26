#!/bin/bash

echo "Testing different Supabase connection formats..."
echo "================================================"

PASSWORD="Trailgunp*123"
PROJECT="pwvudqwxijxpiajnrjyi"

# Test different connection string formats
declare -a HOSTS=(
  "aws-0-ap-south-1.pooler.supabase.com:6543"
  "aws-0-ap-south-1.pooler.supabase.com:5432"
)

declare -a USERS=(
  "postgres.$PROJECT"
  "postgres"
)

for HOST in "${HOSTS[@]}"; do
  for USER in "${USERS[@]}"; do
    URL="postgresql://$USER:$PASSWORD@$HOST/postgres"
    echo ""
    echo "Testing: $USER @ ${HOST}"
    
    python3 -c "
from sqlalchemy import create_engine, text
import sys

try:
    engine = create_engine('$URL', connect_args={'connect_timeout': 5})
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('  ✅ SUCCESS!')
        sys.exit(0)
except Exception as e:
    error = str(e)
    if 'Tenant or user not found' in error:
        print('  ❌ Wrong username format')
    elif 'could not translate' in error:
        print('  ❌ DNS resolution failed')
    elif 'timeout' in error:
        print('  ❌ Connection timeout')
    elif 'password' in error:
        print('  ❌ Wrong password')
    else:
        print(f'  ❌ {error[:100]}')
    sys.exit(1)
" && break 2
  done
done

echo ""
echo "================================================"
