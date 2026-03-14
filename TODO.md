# Hotel Images Upload Fix
## Status: 🔄 In Progress

### Step 1: [✅] Diagnosis Complete
- Frontend FormData not parsed (req.files=0)
- Postman works → backend perfect
- Root cause: axios Content-Type header conflict

### Step 2: [✅] Fix api.js - Add multipart headers to hotelAPI
### Step 3: [ ] Test upload (console Files received:1, image shows)
### Step 4: [ ] Optional: Multiple file support in AddHotel.jsx
### Step 5: [ ] Complete & cleanup TODO
