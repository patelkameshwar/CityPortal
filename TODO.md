# Fix Login Remember Me Persistence Issue

## Steps:
- [ ] Step 1: Create TODO.md with plan breakdown (current)
- [x] Step 2: Edit admin/src/context/AuthContext.jsx to fix login function:\n  * Remove default param `remember = true`\n  * When rememberMe=false: use only sessionStorage, remove cookie setting\n  * Update init logic if needed to avoid cookie fallback when rememberMe=false
- [ ] Step 3: Test login with rememberMe unchecked:
  * Login, close browser, reopen → should go to /login not dashboard
- [ ] Step 4: Test with checked → should persist
- [ ] Step 5: Mark complete, attempt_completion

Current progress: Step 1 complete. Next: Step 2.

