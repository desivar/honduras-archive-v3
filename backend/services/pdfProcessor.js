const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

// ── Extraction Rules ──────────────────────────────────────────────────────────
const EXTRACTION_RULES = {
  deaths:        ['falleció', 'defunción', 'entierro', 'pésame', 'funeraria', 'obituario', 'muerte'],
  marriages:     ['matrimonio', 'boda', 'nupcias', 'contraerán', 'enlace', 'casamiento'],
  births:        ['nacimiento', 'dio a luz', 'recién nacido', 'prole', 'nació', 'bautismo'],
  businesses:    ['sociedad', 'comercio', 'traspaso', 'clausura', 'inauguración', 'almacén', 'empresa'],
  historicEvents:['decreto', 'revolución', 'elecciones', 'tratado', 'batalla', 'guerra'],
};

const LOCATIONS = [
  'Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Comayagua',
  'Choluteca', 'Juticalpa', 'Santa Rosa de Copán', 'Trujillo',
  'Danlí', 'Siguatepeque', 'Tela', 'El Progreso', 'Tocoa',
  'Olanchito', 'Yoro', 'Nacaome', 'Puerto Cortés', 'Roatán',
  'Atlántida', 'Colón', 'Copán', 'Cortés', 'El Paraíso',
  'Francisco Morazán', 'Gracias a Dios', 'Intibucá',
  'Islas de la Bahía', 'La Paz', 'Lempira', 'Ocotepeque',
  'Olancho', 'Santa Bárbara', 'Valle', 'Comayagüela',
  'Distrito Central', 'Gracias', 'Amapala', 'Ojojona',
];

/**
 * processHistoricalPDF
 * Strategy:
 * 1. Try pdf-parse for text layer (works for PDFs with embedded text)
 * 2. If scanned, use Tesseract directly on the PDF buffer
 *    (Tesseract 4+ can handle PDF buffers on Linux/Render)
 */
const processHistoricalPDF = async (pdfBuffer) => {
  try {
    let extractedText = '';

    // ATTEMPT 1: Text layer via pdf-parse (fast)
    console.log('📜 Step 1: Trying pdf-parse...');
    try {
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text || '';
      console.log(`📄 pdf-parse found ${extractedText.length} characters`);
    } catch (parseErr) {
      console.warn('⚠️ pdf-parse failed:', parseErr.message);
    }

    // ATTEMPT 2: Tesseract directly on PDF buffer
    if (!extractedText || extractedText.trim().length < 50) {
      console.log('🔍 Step 2: No text layer. Trying Tesseract on PDF buffer...');
      try {
        const { data: { text } } = await Tesseract.recognize(pdfBuffer, 'spa', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        extractedText = text || '';
        console.log(`✅ Tesseract extracted ${extractedText.length} characters`);
      } catch (ocrErr) {
        console.error('❌ Tesseract failed:', ocrErr.message);
        extractedText = '';
      }
    }

    // ── Category Detection ────────────────────────────────────────────────────
    const lowerText = extractedText.toLowerCase();
    let suggestedCategory = 'News';

    if (EXTRACTION_RULES.deaths.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Death';
    } else if (EXTRACTION_RULES.births.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Birth';
    } else if (EXTRACTION_RULES.businesses.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Business';
    } else if (EXTRACTION_RULES.marriages.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Marriage';
    } else if (EXTRACTION_RULES.historicEvents.some(k => lowerText.includes(k))) {
      suggestedCategory = 'Historic Event';
    }

    // ── Location Detection ────────────────────────────────────────────────────
    const detectedLocation = LOCATIONS.find(loc =>
      lowerText.includes(loc.toLowerCase())
    ) || '';

    const cleanSummary = extractedText.length > 0
      ? extractedText.slice(0, 800).replace(/\n+/g, ' ').trim() + '...'
      : 'No text could be extracted. Please fill in the summary manually.';

    console.log(`✅ Done. Category: ${suggestedCategory} | Location: ${detectedLocation}`);

    return {
      success: true,
      data: {
        extractedText,
        summary: cleanSummary,
        category: suggestedCategory,
        autoFields: {
          category: suggestedCategory,
          summary: cleanSummary,
          location: detectedLocation,
        }
      }
    };

  } catch (error) {
    console.error('❌ Internal AI Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { processHistoricalPDF };