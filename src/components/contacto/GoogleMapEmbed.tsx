export function GoogleMapEmbed() {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden border">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.987!2d-64.1850!3d-31.4201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDI1JzEyLjQiUyA2NMKwMTEnMDYuMCJX!5e0!3m2!1ses!2sar!4v1234567890"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación Centro Vecinal Centro América"
      />
    </div>
  )
}
