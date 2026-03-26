import {
  Html, Head, Body, Container, Heading, Text, Hr, Link, Preview,
} from "@react-email/components"

type Props = {
  nombre:    string
  email:     string
  asunto:    string
  mensaje:   string
  mensajeId: string
}

export function NotificacionContactoEmail({ nombre, email, asunto, mensaje, mensajeId }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const panelUrl = `${baseUrl}/admin/contacto/${mensajeId}`

  return (
    <Html lang="es">
      <Head />
      <Preview>Nuevo mensaje de {nombre}: {asunto}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
          <Heading style={{ fontSize: "20px", color: "#2D6A7F", marginBottom: "8px" }}>
            Nuevo mensaje de contacto
          </Heading>
          <Text style={{ color: "#6b7280", marginTop: 0 }}>
            Recibiste un mensaje desde el formulario de contacto del sitio.
          </Text>

          <Hr style={{ borderColor: "#e5e7eb" }} />

          <Text style={{ marginBottom: "4px" }}><strong>Nombre:</strong> {nombre}</Text>
          <Text style={{ marginBottom: "4px" }}><strong>Email:</strong> {email}</Text>
          <Text style={{ marginBottom: "4px" }}><strong>Asunto:</strong> {asunto}</Text>
          <Text style={{ marginBottom: "4px" }}><strong>Mensaje:</strong></Text>
          <Text style={{ backgroundColor: "#f9fafb", padding: "12px 16px", borderRadius: "6px", whiteSpace: "pre-wrap" }}>
            {mensaje}
          </Text>

          <Hr style={{ borderColor: "#e5e7eb" }} />

          <Link
            href={panelUrl}
            style={{ display: "inline-block", backgroundColor: "#2D6A7F", color: "#ffffff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}
          >
            Ver en el panel →
          </Link>
        </Container>
      </Body>
    </Html>
  )
}
