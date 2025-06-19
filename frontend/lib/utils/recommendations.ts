// Función para procesar las recomendaciones de texto a arrays
export const processRecommendations = (text: string) => {
  const alerts: string[] = []
  const recommendations: string[] = []

  // Función para dividir texto en oraciones respetando números decimales y rangos
  const splitIntoSentences = (text: string) => {
    // Reemplazar temporalmente puntos en números y rangos
    const processedText = text
      .replace(/(\d+)\.(\d+)/g, "$1DECIMAL$2") // 13.82 -> 13DECIMAL82
      .replace(/(\d+)\.(\d+)°C/g, "$1DECIMAL$2°C") // 13.82°C -> 13DECIMAL82°C
      .replace(/(\d+)\.(\d+)%/g, "$1DECIMAL$2%") // 50.0% -> 50DECIMAL0%
      .replace(/(\d+)\.(\d+)–(\d+)\.(\d+)/g, "$1DECIMAL$2–$3DECIMAL$4") // rangos como 10.0–29.0

    // Dividir por puntos seguidos de espacio y mayúscula, o final de línea
    const sentences = processedText.split(/\.\s+(?=[A-Z])|\.$/)

    // Restaurar los puntos decimales
    return sentences
      .map((sentence) => sentence.replace(/DECIMAL/g, ".").trim())
      .filter((sentence) => sentence.length > 5)
  }

  // Dividir por líneas primero
  const lines = text.split(/\r\n|\n/).filter((line) => line.trim())

  lines.forEach((line) => {
    const cleanLine = line.trim()
    if (cleanLine.length === 0) return

    // Dividir la línea en oraciones
    const sentences = splitIntoSentences(cleanLine)

    sentences.forEach((sentence) => {
      const cleanSentence = sentence.trim()
      if (cleanSentence.length === 0) return

      // Palabras clave para alertas (condiciones fuera de rango o problemas)
      const alertKeywords = [
        "excede",
        "supera",
        "por encima",
        "muy alta",
        "muy baja",
        "fuera del rango",
        "no está dentro",
        "por debajo",
        "insuficiente",
        "demasiado",
        "evita",
        "evitar",
        "no debes",
        "no exponer",
        "riesgo",
        "peligro",
        "cuidado",
        "atención",
        "importante",
        "precaución",
        "advertencia",
        "no tolera",
        "puede dañar",
        "daño",
        "quemaduras",
      ]

      // Palabras clave para condiciones positivas
      const positiveKeywords = [
        "dentro del rango ideal",
        "está dentro del rango",
        "rango ideal",
        "está bien",
        "perfecto",
        "adecuado",
        "correcto",
        "óptimo",
        "apropiado",
      ]

      const lowerSentence = cleanSentence.toLowerCase()

      // Verificar si contiene palabras de alerta
      const hasAlert = alertKeywords.some((keyword) => lowerSentence.includes(keyword))

      // Verificar si es una condición positiva
      const isPositive = positiveKeywords.some((keyword) => lowerSentence.includes(keyword))

      // Asegurar que termine con punto
      const finalSentence = cleanSentence + (cleanSentence.endsWith(".") ? "" : ".")

      // Si contiene alerta, va a alertas
      if (hasAlert) {
        alerts.push(finalSentence)
      }
      // Si es positivo Y no tiene alertas, va a recomendaciones
      else if (isPositive) {
        recommendations.push(finalSentence)
      }
      // Si no es ni alerta ni positivo, es una recomendación general
      else {
        recommendations.push(finalSentence)
      }
    })
  })

  return { alerts, recommendations }
}
