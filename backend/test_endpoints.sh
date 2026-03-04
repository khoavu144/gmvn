#!/bin/bash
BASE_URL="http://localhost:3001/api/v1"

echo "=== GYMERVIET API AUTOMATED CHECK ==="
endpoints=(
    "/health"
    "/gyms"
    "/users/trainers"
    "/programs"
)

for ep in "${endpoints[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ep")
    if [ "$status" -eq 200 ]; then
        echo "✅ [PASS] GET $ep (Status: $status)"
    else
        echo "❌ [FAIL] GET $ep (Status: $status)"
    fi
done
