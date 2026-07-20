import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://udxybphezzpptgconhma.supabase.co";

const supabaseKey = "sb_publishable_WgIGQ5MQsVvh6X0R4S7XsA_5Z7V8A6Z";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);