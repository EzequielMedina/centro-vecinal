"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  value?: string
  onChange: (html: string) => void
  disabled?: boolean
}

export function RichTextEditor({ value, onChange, disabled }: Props) {
  const editor = useEditor({
    extensions: [
      // StarterKit v3 incluye Link — lo deshabilitamos aquí y lo configuramos por separado
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value ?? "",
    immediatelyRender: false,
    editable: !disabled,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  function toggleLink() {
    if (editor!.isActive("link")) {
      editor!.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt("URL del link:")
    if (!url) return
    editor!.chain().focus().setLink({ href: url }).run()
  }

  const toolbarBtns = [
    {
      label: "Negrita",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      label: "Cursiva",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      label: "Lista",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "Lista numerada",
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
  ]

  return (
    <div className={cn("rounded-lg border border-input overflow-hidden", disabled && "opacity-50 pointer-events-none")}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 border-b border-input bg-muted/40">
        {toolbarBtns.map(({ label, icon: Icon, action, isActive }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            aria-label={label}
            className={cn(
              "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              isActive && "bg-muted text-foreground"
            )}
          >
            <Icon size={15} />
          </button>
        ))}

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={toggleLink}
          aria-label={editor.isActive("link") ? "Quitar link" : "Agregar link"}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            editor.isActive("link") && "bg-muted text-foreground"
          )}
        >
          {editor.isActive("link") ? <Unlink size={15} /> : <LinkIcon size={15} />}
        </button>
      </div>

      {/* Área de edición */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 min-h-[160px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[140px]"
      />
    </div>
  )
}
