"use client"

import { useState, cloneElement, isValidElement } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Props = {
  trigger: React.ReactElement
  title?: string
  description: string
  onConfirm: () => void
  disabled?: boolean
}

export function ConfirmDeleteDialog({
  trigger,
  title = "¿Eliminar?",
  description,
  onConfirm,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)

  const triggerWithHandler = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          if (!disabled) setOpen(true)
        },
      })
    : trigger

  return (
    <>
      {triggerWithHandler}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onConfirm()
                setOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
