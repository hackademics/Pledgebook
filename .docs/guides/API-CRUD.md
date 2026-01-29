# API CRUD Development Guide

> **Purpose**: This document establishes the standards, patterns, conventions, and best practices for API development in the Pledgebook application. It serves as a reference to ensure consistency and avoid common pitfalls.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Domain Layer](#domain-layer)
4. [Zod Schema Best Practices](#zod-schema-best-practices)
5. [Repository Pattern](#repository-pattern)
6. [Service Layer](#service-layer)
7. [API Routes](#api-routes)
8. [Response Utilities](#response-utilities)
9. [Error Handling](#error-handling)
10. [Common Pitfalls](#common-pitfalls)

---

## Architecture Overview

We follow a **layered architecture** pattern for API development:

```
┌─────────────────────────────────────────────────────────────┐
│                      API Routes (HTTP)                       │
│              /server/api/{domain}/*.ts                       │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                            │
│         Business logic, orchestration, validation            │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                          │
│              Data access, SQL queries, D1                    │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│           Schemas, types, mappers, entities                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Injection**: Repositories are injected into services
- **Type Safety**: Zod schemas define and validate all data structures
- **Testability**: Each layer can be tested in isolation

---

## Folder Structure

```
server/
├── api/
│   └── {domain}/                    # API routes by domain
│       ├── index.get.ts             # GET /api/{domain}
│       ├── index.post.ts            # POST /api/{domain}
│       ├── [id].get.ts              # GET /api/{domain}/:id
│       ├── [id].put.ts              # PUT /api/{domain}/:id
│       ├── [id].patch.ts            # PATCH /api/{domain}/:id
│       ├── [id].delete.ts           # DELETE /api/{domain}/:id
│       ├── featured.get.ts          # GET /api/{domain}/featured (custom)
│       └── [id]/
│           └── children.get.ts      # GET /api/{domain}/:id/children
│
├── domains/
│   └── {domain}/
│       ├── index.ts                 # Barrel exports
│       ├── {domain}.schema.ts       # Zod schemas & types
│       ├── {domain}.mapper.ts       # Entity <-> DTO transformations
│       ├── {domain}.repository.ts   # Data access layer
│       └── {domain}.service.ts      # Business logic layer
│
└── utils/
    ├── cloudflare.ts                # Cloudflare bindings helper
    ├── errors.ts                    # Error handling utilities
    └── response.ts                  # Response formatting utilities
```

### File Naming Conventions

| File Type        | Convention                              | Example                  |
| ---------------- | --------------------------------------- | ------------------------ |
| API Route (GET)  | `{resource}.get.ts` or `index.get.ts`   | `featured.get.ts`        |
| API Route (POST) | `{resource}.post.ts` or `index.post.ts` | `index.post.ts`          |
| Dynamic Route    | `[param].{method}.ts`                   | `[id].get.ts`            |
| Nested Route     | `[param]/{resource}.get.ts`             | `[id]/children.get.ts`   |
| Schema           | `{domain}.schema.ts`                    | `category.schema.ts`     |
| Repository       | `{domain}.repository.ts`                | `category.repository.ts` |
| Service          | `{domain}.service.ts`                   | `category.service.ts`    |
| Mapper           | `{domain}.mapper.ts`                    | `category.mapper.ts`     |

---

## Domain Layer

### Schema File Structure

Each domain schema file should contain:

```typescript
// {domain}.schema.ts

import { z } from 'zod'

// =============================================================================
// FIELD VALIDATORS (reusable)
// =============================================================================

export const entityIdSchema = z.string().min(2).max(50)
export const entityNameSchema = z.string().min(2).max(100).trim()

// =============================================================================
// ENTITY SCHEMAS
// =============================================================================

// Database row representation
export const entitySchema = z.object({
  id: entityIdSchema,
  name: entityNameSchema,
  // ... other fields
  created_at: z.string(),
  updated_at: z.string(),
})

// API response representation (camelCase)
export const entityResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const createEntitySchema = z.object({
  // Required fields
  name: entityNameSchema,
  // Optional fields with defaults
  isActive: z.boolean().optional().default(true),
})

export const updateEntitySchema = z.object({
  // All fields optional for partial updates
  name: entityNameSchema.optional(),
  isActive: z.boolean().optional(),
})

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

// See "Zod Schema Best Practices" section for query param handling
export const listEntityQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  // ... filters
})

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Entity = z.infer<typeof entitySchema>
export type EntityResponse = z.infer<typeof entityResponseSchema>
export type CreateEntityInput = z.output<typeof createEntitySchema> // Use z.output for defaults!
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>
export type ListEntityQuery = z.output<typeof listEntityQuerySchema> // Use z.output for defaults!
```

### Barrel Exports (index.ts)

```typescript
// domains/{domain}/index.ts

// Schemas & Types
export {
  entitySchema,
  entityResponseSchema,
  createEntitySchema,
  updateEntitySchema,
  listEntityQuerySchema,
  type Entity,
  type EntityResponse,
  type CreateEntityInput,
  type UpdateEntityInput,
  type ListEntityQuery,
} from './{domain}.schema'

// Mapper
export { toEntityResponse, toEntityResponseList } from './{domain}.mapper'

// Repository
export { type EntityRepository, createEntityRepository } from './{domain}.repository'

// Service
export { type EntityService, createEntityService } from './{domain}.service'
```

---

## Zod Schema Best Practices

### ⚠️ CRITICAL: Type Inference with Defaults

When a Zod schema has `.default()` or `.transform()`, you **MUST** use `z.output` instead of `z.infer`:

```typescript
// ❌ WRONG - z.infer gives the INPUT type (before defaults applied)
export type CreateEntityInput = z.infer<typeof createEntitySchema>
// Results in: { isActive?: boolean | undefined }

// ✅ CORRECT - z.output gives the OUTPUT type (after defaults applied)
export type CreateEntityInput = z.output<typeof createEntitySchema>
// Results in: { isActive: boolean }
```

### Query Parameter Coercion

Query parameters from `getQuery()` are always strings or undefined. Use this pattern for proper coercion:

```typescript
/**
 * Coerce string to number with undefined fallback
 * z.coerce.number() FAILS when value is undefined!
 */
const coerceNumber = (defaultValue: number) =>
  z.preprocess(
    (val) => (val === undefined || val === '' ? defaultValue : Number(val)),
    z.number().int()
  )

// Usage
export const listQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
})
```

### Boolean Query Parameters

Query params are strings, not booleans. Use string transformation:

```typescript
// ❌ WRONG - z.coerce.boolean() treats ANY string as truthy
isActive: z.coerce.boolean().optional()
// "false" becomes true!

// ✅ CORRECT - Explicit string comparison
isActive: z.string()
  .optional()
  .transform((val) => (val === undefined ? undefined : val === 'true'))
```

### SQLite Boolean Handling

SQLite stores booleans as 0/1 integers. Handle this in your entity schema:

```typescript
is_active: z.union([z.boolean(), z.number()])
  .transform((val) => Boolean(val))
  .default(true)
```

---

## Repository Pattern

### Interface Definition

```typescript
export interface EntityRepository {
  findById(id: string): Promise<Entity | null>
  findAll(query: ListEntityQuery): Promise<{ data: Entity[]; total: number }>
  create(input: CreateEntityInput): Promise<Entity>
  update(id: string, input: UpdateEntityInput): Promise<Entity | null>
  delete(id: string): Promise<boolean>
  exists(id: string): Promise<boolean>
  count(filters?: Record<string, unknown>): Promise<number>
}
```

### Factory Function

```typescript
export function createEntityRepository(db: D1Database): EntityRepository {
  return {
    async findById(id: string): Promise<Entity | null> {
      const result = await db
        .prepare('SELECT * FROM entities WHERE id = ?')
        .bind(id)
        .first<Entity>()
      return result ?? null
    },

    // ... other methods
  }
}
```

### SQL Best Practices

1. **Always use parameterized queries** to prevent SQL injection:

   ```typescript
   // ✅ CORRECT
   db.prepare('SELECT * FROM entities WHERE id = ?').bind(id)

   // ❌ NEVER do this
   db.prepare(`SELECT * FROM entities WHERE id = '${id}'`)
   ```

2. **Build dynamic WHERE clauses safely**:

   ```typescript
   const conditions: string[] = []
   const params: (string | number | boolean)[] = []

   if (isActive !== undefined) {
     conditions.push('is_active = ?')
     params.push(isActive ? 1 : 0)
   }

   const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
   ```

3. **Use LIMIT/OFFSET for pagination**:
   ```typescript
   const offset = (page - 1) * limit
   // Add LIMIT and OFFSET to params
   params.push(limit, offset)
   ```

---

## Service Layer

### Interface Definition

```typescript
export interface EntityService {
  getById(id: string): Promise<EntityResponse>
  getAll(query: ListEntityQuery): Promise<{
    data: EntityResponse[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  create(input: CreateEntityInput): Promise<EntityResponse>
  update(id: string, input: UpdateEntityInput): Promise<EntityResponse>
  delete(id: string): Promise<void>
}
```

### Implementation Pattern

```typescript
export function createEntityService(repository: EntityRepository): EntityService {
  return {
    async getById(id: string): Promise<EntityResponse> {
      const entity = await repository.findById(id)

      if (!entity) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Entity '${id}' not found`, {
          resourceType: 'entity',
          resourceId: id,
        })
      }

      return toEntityResponse(entity)
    },

    async getAll(query: ListEntityQuery) {
      const { data, total } = await repository.findAll(query)

      return {
        data: toEntityResponseList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    async create(input: CreateEntityInput): Promise<EntityResponse> {
      // Check for duplicates if needed
      const exists = await repository.exists(input.id)
      if (exists) {
        throw createApiError(ApiErrorCode.CONFLICT, `Entity '${input.id}' already exists`)
      }

      const entity = await repository.create(input)
      return toEntityResponse(entity)
    },

    // ... other methods
  }
}
```

---

## API Routes

### Standard Route Template

```typescript
// api/{domain}/index.get.ts

import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseQuery } from '../../utils/response'
import {
  createEntityRepository,
  createEntityService,
  listEntityQuerySchema,
} from '../../domains/{domain}'

export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate input
    const query = parseQuery(event, listEntityQuerySchema)

    // Initialize layers
    const repository = createEntityRepository(DB)
    const service = createEntityService(repository)

    // Execute business logic
    const { data, meta } = await service.getAll(query)

    // Return response
    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
```

### HTTP Method Conventions

| Method       | Purpose          | Response Code | Returns        |
| ------------ | ---------------- | ------------- | -------------- |
| GET (list)   | List resources   | 200           | Array + meta   |
| GET (single) | Get one resource | 200           | Object         |
| POST         | Create resource  | 201           | Created object |
| PUT          | Full update      | 200           | Updated object |
| PATCH        | Partial update   | 200           | Updated object |
| DELETE       | Remove resource  | 204           | No content     |

### Route Parameter Access

```typescript
import { getRequiredParam } from '../../utils/response'

// Get required path parameter
const id = getRequiredParam(event, 'id')
```

---

## Response Utilities

### Standard Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}
```

### Response Helpers

```typescript
// Success with data
return sendSuccess(event, data, meta)

// Created (201)
return sendCreated(event, data)

// No content (204)
return respondNoContent(event)
```

### Input Parsing

```typescript
// Parse request body
const input = await parseBody(event, createEntitySchema)

// Parse query parameters
const query = parseQuery(event, listEntityQuerySchema)
```

---

## Error Handling

### Error Codes

```typescript
export enum ApiErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

### Creating Errors

```typescript
import { createApiError, ApiErrorCode } from '../../utils/errors'

// Not found
throw createApiError(ApiErrorCode.NOT_FOUND, `Entity '${id}' not found`, {
  resourceType: 'entity',
  resourceId: id,
})

// Conflict (duplicate)
throw createApiError(ApiErrorCode.CONFLICT, `Entity '${id}' already exists`)

// Validation error
throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Invalid input', {
  field: 'email',
  reason: 'Invalid email format',
})
```

### Handling Errors in Routes

```typescript
export default defineEventHandler(async (event) => {
  try {
    // ... route logic
  } catch (error) {
    throw handleError(error) // Converts to proper H3 error
  }
})
```

---

## Common Pitfalls

### ❌ Pitfall 1: Wrong Type Inference

**Problem**: Using `z.infer` with schemas that have defaults results in optional types.

```typescript
// Schema with default
const schema = z.object({
  isActive: z.boolean().default(true),
})

// ❌ z.infer gives: { isActive?: boolean | undefined }
type Wrong = z.infer<typeof schema>

// ✅ z.output gives: { isActive: boolean }
type Correct = z.output<typeof schema>
```

### ❌ Pitfall 2: Query Parameter Coercion

**Problem**: `z.coerce.number()` converts `undefined` to `NaN` which fails validation.

```typescript
// ❌ Fails when param is missing
page: z.coerce.number().default(1)

// ✅ Use preprocess to handle undefined
page: z.preprocess(
  (val) => (val === undefined || val === '' ? 1 : Number(val)),
  z.number().int()
).pipe(z.number().min(1))
```

### ❌ Pitfall 3: Boolean Query Params

**Problem**: `z.coerce.boolean()` treats any non-empty string as `true`.

```typescript
// ❌ "false" becomes true
isActive: z.coerce.boolean()

// ✅ Explicit string comparison
isActive: z.string()
  .optional()
  .transform((val) => val === 'true')
```

### ❌ Pitfall 4: Naming Conflicts

**Problem**: Function names conflicting with h3 built-ins.

```typescript
// ❌ sendNoContent conflicts with h3
export function sendNoContent(event: H3Event) { ... }

// ✅ Use unique prefix
export function respondNoContent(event: H3Event) { ... }
```

### ❌ Pitfall 5: Import Paths

**Problem**: Using alias imports that don't resolve correctly.

```typescript
// ❌ May not resolve in all contexts
import { useCloudflare } from '~/server/utils/cloudflare'

// ✅ Use relative imports for server code
import { useCloudflare } from '../../utils/cloudflare'
```

### ❌ Pitfall 6: SQLite Booleans

**Problem**: SQLite stores booleans as integers (0/1).

```typescript
// ❌ Direct boolean comparison fails
WHERE is_active = true

// ✅ Use 1/0 for SQLite
WHERE is_active = 1

// In repository code:
params.push(isActive ? 1 : 0)
```

---

## Checklist for New Domains

When creating a new domain API, ensure you:

- [ ] Create schema file with all validators and types
- [ ] Use `z.output` for types with defaults
- [ ] Use `coerceNumber()` helper for numeric query params
- [ ] Use string transform for boolean query params
- [ ] Handle SQLite boolean storage (0/1)
- [ ] Create mapper with snake_case → camelCase conversion
- [ ] Create repository interface and factory function
- [ ] Use parameterized queries for all SQL
- [ ] Create service with business logic and error handling
- [ ] Create barrel exports in index.ts
- [ ] Create API routes following naming conventions
- [ ] Use relative imports for server utilities
- [ ] Wrap route handlers in try/catch with handleError
- [ ] Return appropriate HTTP status codes

---

## Quick Reference

### Type Export Pattern

```typescript
// Use z.infer for schemas WITHOUT defaults
export type Entity = z.infer<typeof entitySchema>

// Use z.output for schemas WITH defaults or transforms
export type CreateEntityInput = z.output<typeof createEntitySchema>
```

### Query Schema Template

```typescript
const coerceNumber = (defaultValue: number) =>
  z.preprocess(
    (val) => (val === undefined || val === '' ? defaultValue : Number(val)),
    z.number().int()
  )

export const listQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  sortBy: z.enum(['name', 'created_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
})
```

### API Route Template

```typescript
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)
    const query = parseQuery(event, querySchema)
    const repository = createRepository(DB)
    const service = createService(repository)
    const result = await service.method(query)
    return sendSuccess(event, result.data, result.meta)
  } catch (error) {
    throw handleError(error)
  }
})
```
