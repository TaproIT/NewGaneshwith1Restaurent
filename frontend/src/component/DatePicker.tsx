"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  return date instanceof Date && !isNaN(date.getTime())
}

interface DatePickerProps {
  defaultDate?: Date
  onDateChange?: (date: Date | undefined) => void
}

export function DatePicker({ defaultDate, onDateChange }: DatePickerProps) {
  const today = new Date()
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    defaultDate ?? today
  )
  const [month, setMonth] = React.useState<Date | undefined>(
    defaultDate ?? today
  )
  const [value, setValue] = React.useState(formatDate(defaultDate ?? today))

  React.useEffect(() => {
    if (onDateChange) {
      onDateChange(date)
    }
  }, [date, onDateChange])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center justify-center gap-2">
        <Input
          id="date"
          value={value}
          placeholder={formatDate(today)}
          className="bg-transparent text-[0.75rem] pr-10"
          onChange={(e) => {
            const newDate = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(newDate)) {
              setDate(newDate)
              setMonth(newDate)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(newDate) => {
                setDate(newDate)
                setValue(formatDate(newDate))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
