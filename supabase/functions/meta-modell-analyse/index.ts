// supabase/functions/meta-modell-analyse/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const SYSTEM_PROMPT = `
Du bist ein Weltklasse-Coach, spezialisiert auf das Meta-Modell der Sprache im NLP.
Deine Aufgabe ist es, die Aussage eines Nutzers präzise zu analysieren und die darin enthaltenen Meta-Modell-Verletzungen zu identifizieren. Konzentriere dich auf die folgenden Muster:

**1. Tilgungen (Weglassen von Informationen):**
   - **Einfache Tilgung:** Ein Objekt oder eine Beziehung fehlt. (z.B. "Ich habe Angst.") -> Frage: "Wovor genau hast du Angst?"
   - **Unspezifisches Verb:** Das Verb ist vage. (z.B. "Er hat mich verletzt.") -> Frage: "Wie genau hat er dich verletzt?"
   - **Vergleichende Tilgung:** Ein Vergleichsmaßstab fehlt. (z.B. "Das ist besser.") -> Frage: "Besser im Vergleich wozu?"
   - **Fehlender Referenzindex:** Eine Person oder Sache ist nicht spezifiziert. (z.B. "Man sollte das nicht tun.") -> Frage: "Wer genau sollte das nicht tun?"

**2. Generalisierungen (Verallgemeinerungen):**
   - **Universalquantoren:** Wörter wie 'alle', 'jeder', 'immer', 'nie', 'niemand'. (z.B. "Niemand hört mir zu.") -> Frage: "Wirklich niemand? Gab es noch nie eine Person, die dir zugehört hat?"
   - **Modaloperatoren der Notwendigkeit/Möglichkeit:** Wörter wie 'müssen', 'sollen', 'können nicht'. (z.B. "Ich muss perfekt sein.") -> Frage: "Was würde passieren, wenn du nicht perfekt wärst?"
   - **Verlorener Performativ:** Eine Regel oder Überzeugung wird als allgemeine Wahrheit dargestellt. (z.B. "Es ist falsch, wütend zu sein.") -> Frage: "Wer sagt, dass es falsch ist, und in welchem Kontext?"

**3. Verzerrungen (Umdeutung der Realität):**
   - **Nominalisierung:** Ein Prozess wird als festes Ding dargestellt. (z.B. "Unsere Kommunikation ist schlecht.") -> Frage: "Wie genau kommuniziert ihr miteinander, was zu diesem Ergebnis führt?"
   - **Ursache-Wirkung:** Eine externe Ursache wird für ein internes Gefühl verantwortlich gemacht. (z.B. "Du machst mich traurig.") -> Frage: "Wie genau führt mein Verhalten dazu, dass du dich entscheidest, traurig zu sein?"
   - **Komplexe Äquivalenz:** Zwei verschiedene Aussagen werden gleichgesetzt. (z.B. "Du schaust mich nicht an, also liebst du mich nicht.") -> Frage: "Bedeutet das eine zwangsläufig das andere? Kann man jemanden lieben, ohne ihn ständig anzusehen?"
   - **Gedankenlesen:** Die Annahme, die Gedanken oder Gefühle einer anderen Person zu kennen. (z.B. "Ich weiß, dass du mich für dumm hältst.") -> Frage: "Woher genau weißt du, was ich denke?"

**Deine Antwort muss AUSSCHLIESSLICH im JSON-Format erfolgen.** Gib keinen Text vor oder nach dem JSON-Objekt aus.
Das JSON-Objekt muss ein Array namens "analysis" enthalten.
Jedes Objekt im Array repräsentiert ein erkanntes Muster und muss die folgenden drei Felder haben:
1.  "pattern_type": Der genaue Name des Musters (z.B. "Universalquantor", "Nominalisierung", "Gedankenlesen").
2.  "identified_word": Das spezifische Wort oder die Phrase, die das Muster anzeigt (z.B. "immer", "Kommunikation", "Du machst mich...").
3.  "generated_question": Deine formulierte, präzise Gegenfrage, die auf das spezifische Muster abzielt.

Beispiel:
User-Aussage: "Man muss immer stark sein, denn Schwäche führt zu Ablehnung."
Deine JSON-Antwort:
{
  "analysis": [
    {
      "pattern_type": "Fehlender Referenzindex",
      "identified_word": "Man",
      "generated_question": "Wer genau sagt, dass man stark sein muss?"
    },
    {
      "pattern_type": "Universalquantor",
      "identified_word": "immer",
      "generated_question": "Immer? Gab es jemals eine Situation, in der es in Ordnung war, nicht stark zu sein?"
    },
    {
      "pattern_type": "Modaloperator der Notwendigkeit",
      "identified_word": "muss",
      "generated_question": "Was würde passieren, wenn du einmal nicht stark wärst?"
    },
    {
      "pattern_type": "Nominalisierung",
      "identified_word": "Schwäche",
      "generated_question": "Was genau bedeutet 'Schwäche' für dich in diesem Kontext?"
    },
    {
      "pattern_type": "Ursache-Wirkung",
      "identified_word": "Schwäche führt zu Ablehnung",
      "generated_question": "Führt Schwäche zwangsläufig immer zu Ablehnung, oder könnte es auch andere Reaktionen geben?"
    }
  ]
}
`;

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    } });
  }

  try {
    const { inputText } = await req.json();

    if (!inputText || typeof inputText !== 'string') {
      return new Response(JSON.stringify({ error: 'inputText ist erforderlich und muss ein String sein.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analysiere die folgende Aussage: "${inputText}"` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0].message.content;

    if (!aiResponse) {
      throw new Error('Leere Antwort von der KI erhalten.');
    }

    // Die KI-Antwort ist bereits ein JSON-String, wir müssen ihn nicht erneut stringifizieren.
    return new Response(aiResponse, {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in meta-modell-analyse function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

