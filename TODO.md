# ClientDashboard Chart Date Format Update

## Plan Breakdown & Progress

### 1. [x] Create TODO.md with task steps
   - Track progress for date format changes in ClientDashboard.jsx

### 2. [ ] Add formatDayMonth function
   - New helper after formatMonthYear for 'day' period: {day: 'numeric', month: 'short'} e.g. "17 Mar"

### 3. [ ] Update XAxis tickFormatter
   - Dynamic: currentPeriod === 'day' ? formatDayMonth : formatMonthYear

### 4. [ ] Test changes
   - Run dev server, switch periods, verify formats (day: "17 Mar", month/year: "Mar 25")
   - Check console/errors

### 5. [ ] attempt_completion
   - Confirm task done
