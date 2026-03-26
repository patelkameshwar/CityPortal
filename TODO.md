# CityPortal - Sub-Amenities in EditItems.jsx Implementation Plan

## Current Status
- [x] Analyzed EditItems.jsx and AddHotel.jsx
- [x] Created detailed edit plan 
- [x] Got user approval
- [ ] Created TODO.md ✅

## Implementation Steps (to be marked done after each)

1. [ ] **Add state variables** - Sub-amenity arrays to formData, newItem states, suggestion flags, tab state, highlighted indexes (useEffect for isHotel only)
2. [ ] **Add popular arrays** - Copy popularBasicFacilities, popularRoomAmenities, etc. from AddHotel
3. [ ] **Update data mapping** - Extend mapApiDataToForm and mapFormDataToApi for sub-amenities
4. [ ] **Add handlers** - Copy/adapt 12 handlers (handleXXXInput/KeyDown, addXXX, removeXXX for 4 categories)
5. [ ] **Insert UI section** - Add tabbed Sub-Amenities JSX after policies (if(isHotel)), copy full tab/input/suggestion/chips/colors from AddHotel, match styling
6. [ ] **Update form submit** - Append sub-amenities JSON to FormData
7. [ ] **Test & update TODO** - Run dev server, test hotel edit, verify load/save/tabs/chips
8. [ ] **Complete** - Use attempt_completion

**Notes:**
- Only edit admin/src/pages/EditItems.jsx
- Preserve all existing functionality (events unchanged)
- Match EditItems styling/colors where possible
- Chips: indigo(purple? wait indigo-100 for basic), purple-100(room), green-100(health), red-100(safety)

**Next step:** Implement states and arrays (step 1-2)

