async function loadDataFromSupabase() {
  if (!SUPABASE_ENABLED || !window.supabaseClient) {
    return null;
  }

  try {
    const [
      categoriesResult,
      informationResult,
      commentsResult,
      testimonialsResult,
    ] = await Promise.all([
      supabaseClient
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true }),

      supabaseClient
        .from("information")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true }),

      supabaseClient
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false }),

      supabaseClient
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true }),
    ]);

    if (
      categoriesResult.error ||
      informationResult.error ||
      commentsResult.error ||
      testimonialsResult.error
    ) {
      throw new Error("Cannot load Supabase data.");
    }

    return {
      categories: categoriesResult.data || [],
      information: informationResult.data || [],
      comments: commentsResult.data || [],
      testimonials: testimonialsResult.data || [],
    };
  } catch (error) {
    console.warn("Supabase fallback to local data:", error.message);
    return null;
  }
}

function getSupabaseImageUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  const cleanPath = path.startsWith("images/")
    ? path
    : `images/${path}`;

  const { data } = supabaseClient.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(cleanPath);

  return data.publicUrl;
}

async function saveContactToSupabase(contactData) {
  if (!SUPABASE_ENABLED || !window.supabaseClient) {
    return false;
  }

  const { error } = await supabaseClient
    .from("contacts")
    .insert(contactData);

  return !error;
}

async function saveSubscriberToSupabase(email) {
  if (!SUPABASE_ENABLED || !window.supabaseClient) {
    return false;
  }

  const { error } = await supabaseClient
    .from("subscribers")
    .insert({ email });

  return !error;
}
