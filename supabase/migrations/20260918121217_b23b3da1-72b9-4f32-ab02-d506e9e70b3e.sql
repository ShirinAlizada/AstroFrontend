CREATE OR REPLACE FUNCTION public.increment_article_views(_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles SET views = views + 1 WHERE slug = _slug AND published = true;
$$;

REVOKE ALL ON FUNCTION public.increment_article_views(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_article_views(text) TO anon, authenticated;