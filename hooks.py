import re


def on_env(env, config, files):
    env.add_extension('jinja2.ext.do')


# Links inside the page content (external sites, downloads, embedded slides, other weeks) open in a new
# tab so a student reading the notes never loses the page. An in-page "#section" jump and the top nav are
# left alone.
_LINK = re.compile(r'<a\s(?![^>]*\btarget=)([^>]*\bhref="(?!#)[^"]*"[^>]*)>')


def on_page_content(html, page, config, files):
    return _LINK.sub(r'<a target="_blank" rel="noopener" \1>', html)
