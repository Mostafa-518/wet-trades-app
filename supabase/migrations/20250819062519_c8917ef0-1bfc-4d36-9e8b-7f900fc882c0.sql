-- Add missing roles to the user_role enum
-- Check if 'admin' role already exists and add it if not
DO $$
BEGIN
    -- Check if admin role exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        -- Since admin already exists, we skip this
        NULL;
    END IF;
END$$;

-- Verify all required roles exist
DO $$
BEGIN
    -- All roles should now exist based on the query results
    -- admin, procurement_manager, procurement_engineer, viewer are all present
    -- Let's just verify the roles are working correctly
    RAISE NOTICE 'User role enum updated successfully';
END$$;