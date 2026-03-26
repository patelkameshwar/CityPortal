# CityPortal Fix: EditItems.jsx Policies Error

## Steps to Complete:

- [ ] **Step 1**: Understand current TODO.md contents (if any) and integrate this fix.
- [ ] **Step 2**: Edit `admin/src/pages/EditItems.jsx`:
  - Always initialize `formData.policies` as array in `mapApiDataToForm()`.
  - Add `(formData.policies || []).length` defensive checks in addPolicy, removePolicy, and JSX.
  - Wrap entire Policies section in `{isHotel && (...)}`.
- [ ] **Step 3**: Test the fix:
  - Navigate to hotel edit: verify policies work.
  - Navigate to event edit: verify no errors, policies section hidden.
- [ ] **Step 4**: Clean up TODO.md and confirm completion.

**Progress**: Starting Step 1 now.

**Current Issue**: `Uncaught TypeError: can't access property "length", formData.policies is undefined` in EditItems.jsx line 1496.

