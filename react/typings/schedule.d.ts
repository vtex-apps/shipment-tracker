interface ScheduleViewResponse {
  viewSchedule: Schedule | null
}

interface ScheduleCreateResponse {
  createSchedule: {
    nextExecution: string
  }
}

interface Schedule {
  nextExecution: string
  lastInteractionIn?: string
}
