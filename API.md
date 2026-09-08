idk gemini said to make this but i think its just to help with documentation between frontend and backend. who knows tho ill figure it out or delete it later.


# Backend API Reference

Base URL: `/api`

### Auth Header Requirement
All endpoints except `/register` require:
`Authorization: Bearer <supabase_access_token>`

---

### POST `/api/submit-tip`
* **Payload:** `{ personIds: number[], points: number, reason?: string, description?: string }`
* **Response:** `{ success: true }` or `{ error: string }`

### POST `/api/admin-action`
* **Payload:** `{ action: "undo_tip" | "add_person" | "remove_person", payload: object }`
* **Response:** `{ success: true, message: string }`

### POST `/api/manage-users`
* **Payload:** `{ action: "create_user" | "update_role" | "delete_user", ...params }`
* **Response:** `{ success: true }`

### POST `/api/register`
* **Payload:** `{ email, password, registrationKey }`
* **Response:** `{ success: true }`