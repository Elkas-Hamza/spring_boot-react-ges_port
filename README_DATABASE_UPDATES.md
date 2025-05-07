# Database Structure Updates

This update adds support for two types of containers: ship containers and land containers.

## What's New

### New Tables

- `navire` - Stores information about ships
- `type_conteneur` - Stores container types (NAVIRE for ship containers, TERRE for land containers)

### Changes to Existing Tables

- `conteneure` - Added columns for container type and ship reference
- `escale` - Modified to reference ships from the navire table

## How to Apply Updates

### 1. Run the SQL Script

Execute the `db_update.sql` script on your MySQL database:

```sql
mysql -u your_username -p your_database < db_update.sql
```

Or you can run it directly in your MySQL client.

### 2. Migrate Existing Data

After running the script, execute the migration procedure to create navire entries based on existing escale records:

```sql
CALL migrate_data();
```

This will:

1. Create navire entries for each distinct ship name in escale records
2. Update escale records to reference the navire entries
3. Set up the necessary foreign key relationships

### 3. Container Types

Two default container types are created:

- `NAVIRE` - Containers located on ships
- `TERRE` - Containers located on land

You can now categorize containers by assigning them to one of these types.

### 4. Working with the Updated Model

#### Ship Containers

To mark a container as a ship container:

1. Set its type_id to reference the NAVIRE type
2. Assign a ship (MATRICULE_navire) to the container

#### Land Containers

To mark a container as a land container:

1. Set its type_id to reference the TERRE type
2. Leave the MATRICULE_navire as NULL

## Compatibility

A database view `v_conteneurs` has been created to provide compatibility with existing code that may expect the previous schema structure.

## Helper Functions

Two helper functions have been created to assist with querying containers:

- `get_conteneurs_by_type(type_name)` - Get all container IDs with a specific type
- `get_conteneurs_by_navire(matricule)` - Get all container IDs associated with a specific ship

Example usage:

```sql
SELECT get_conteneurs_by_type('NAVIRE');
SELECT get_conteneurs_by_navire('NAV-001');
```
