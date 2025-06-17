const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: Missing Supabase environment variables. Please check your .env file.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTemplates() {
  try {
    const { data, error } = await supabase
      .from("journal_templates")
      .select("*")
      .order("order_index");

    if (error) {
      console.error("Error fetching templates:", error);
      return;
    }

    console.log("Found templates:", data?.length || 0);

    if (data) {
      data.forEach((template) => {
        console.log("\n=== Template ===");
        console.log("ID:", template.id);
        console.log("Title:", template.title);
        console.log("Description:", template.description || "No description");
        console.log("Has translations:", !!template.translations);

        if (template.translations) {
          console.log(
            "Available languages:",
            Object.keys(template.translations),
          );
          if (template.translations.en) {
            console.log(
              "English title:",
              template.translations.en.title || "No EN title",
            );
            console.log(
              "English description:",
              template.translations.en.description || "No EN description",
            );
            console.log(
              "English questions count:",
              template.translations.en.promptQuestions?.length || 0,
            );
          }
        }
      });
    }
  } catch (err) {
    console.error("Script error:", err);
  }
}

debugTemplates();
