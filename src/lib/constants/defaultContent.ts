export type SeccionKey = "historia" | "mision" | "valores"

export const DEFAULT_CONTENT: Record<SeccionKey, string> = {
  historia: `
    <p>El Centro Vecinal Centro América nació de la iniciativa de vecinos comprometidos con el desarrollo y el bienestar de nuestra comunidad. Desde nuestros inicios, hemos trabajado incansablemente para construir un espacio de encuentro, solidaridad y crecimiento colectivo.</p>
    <p>A lo largo de los años, hemos crecido junto al barrio, adaptándonos a las necesidades de nuestros vecinos y sumando nuevos servicios y programas que mejoran la calidad de vida de todos.</p>
  `.trim(),

  mision: `
    <h3>Misión</h3>
    <p>Promover el bienestar integral de los vecinos del barrio Centro América, fomentando la participación comunitaria, el acceso a servicios esenciales y el desarrollo de actividades culturales, educativas y deportivas.</p>
    <h3>Visión</h3>
    <p>Ser un espacio de referencia barrial donde cada vecino encuentre contención, oportunidades de crecimiento y un sentido genuino de comunidad.</p>
  `.trim(),

  valores: `
    <ul>
      <li><strong>Solidaridad</strong>: Nos apoyamos mutuamente y trabajamos juntos por el bien común.</li>
      <li><strong>Inclusión</strong>: Todas las personas son bienvenidas, sin distinción alguna.</li>
      <li><strong>Compromiso</strong>: Actuamos con responsabilidad y dedicación hacia nuestra comunidad.</li>
      <li><strong>Transparencia</strong>: Gestionamos los recursos del centro de manera abierta y honesta.</li>
      <li><strong>Participación</strong>: Incentivamos la voz y el protagonismo de cada vecino.</li>
    </ul>
  `.trim(),
}
