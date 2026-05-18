import DOMPurify from "isomorphic-dompurify"

// Tags y atributos permitidos para el contenido del editor WYSIWYG
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "a", "blockquote",
]

const ALLOWED_ATTR = ["href", "target", "rel"]

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Permite href/target/rel en <a> — el editor TipTap ya agrega rel="noopener noreferrer"
    FORCE_BODY: false,
    ADD_ATTR: ["target"],
  })
}
