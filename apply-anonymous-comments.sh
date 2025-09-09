#!/bin/bash

echo "Applying anonymous comments migration..."
echo "This will update your database to support anonymous comments."
echo ""

# Apply the migration
supabase migration up

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Anonymous comments are now enabled. Users can:"
    echo "- Comment without signing in by providing their name"
    echo "- Still sign in to comment with their profile"  
    echo "- See which comments are anonymous with a badge"
    echo ""
    echo "The migration:"
    echo "- Made user_id optional in comments table"
    echo "- Added is_anonymous flag"
    echo "- Updated RLS policies to allow anonymous comments"
    echo "- Fixed policy conflicts with existing policies"
else
    echo "❌ Migration failed. Please check your Supabase connection."
    echo "If you see policy conflicts, the migration has been updated to handle existing policies."
    exit 1
fi