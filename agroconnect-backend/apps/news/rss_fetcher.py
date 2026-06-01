"""
Récupération et parsing de flux RSS — actualités agricoles Bénin / Afrique de l'Ouest.
"""
import re
import html
import hashlib
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; AgroSaaNuu/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
}
TIMEOUT = 8

# ── Mots-clés OBLIGATOIRES (au moins 1 doit être présent) ──────
KEYWORDS_REQUIS = [
    'agriculture', 'agricole', 'agri',
    'céréale', 'cereal', 'grain', 'graine',
    'maïs', 'mais', 'riz', 'mil', 'sorgho', 'soja', 'arachide',
    'haricot', 'niébé', 'manioc', 'igname', 'coton',
    'récolte', 'moisson', 'culture', 'plantation', 'semence',
    'paysan', 'agriculteur', 'producteur', 'coopérative', 'cooperative',
    'fertilisant', 'engrais', 'irrigation', 'agroalimentaire',
    'sécurité alimentaire', 'food security', 'alimentation',
    'élevage', 'pêche', 'pastoral', 'sylviculture',
    'fao', 'maep', 'ministère de l\'agriculture',
    'bénin', 'benin',  # articles sur le Bénin en général (agriculture implicite)
]

# Mots qui EXCLUENT l'article même s'il contient un keyword
KEYWORDS_EXCLUS = [
    'militaire', 'armée', 'guerre', 'combat', 'soldat',
    'cuba', 'russie', 'ukraine', 'chine', 'états-unis',
    'sport', 'football', 'basketball', 'tennis', 'jeux olympiques',
    'cinéma', 'musique', 'chanson', 'célébrité', 'acteur', 'actrice',
    'procès', 'tribunal', 'prison', 'assassinat', 'meurtre',
    'covid', 'vaccin', 'épidémie', 'pandémie',
    'cep 2026', 'examen', 'baccalauréat', 'bac',
    'élection', 'vote', 'candidat politique',
]

# ── Sources RSS ────────────────────────────────────────────────
RSS_SOURCES = [
    # Sources spécialisées agriculture Afrique
    {
        'url':    'https://news.un.org/feed/subscribe/fr/news/topic/food/feed/rss.xml',
        'source': 'ONU / Alimentation',
        'color':  '#009edb',
        'strict': False,   # Source déjà filtrée agriculture
    },
    {
        'url':    'https://www.fao.org/news/rss-news-detail/fr/',
        'source': 'FAO',
        'color':  '#1a9641',
        'strict': False,
    },
    # Presse africaine généraliste (filtrage strict)
    {
        'url':    'https://www.rfi.fr/fr/rss/actualites/afrique.rss',
        'source': 'RFI Afrique',
        'color':  '#e63946',
        'strict': True,
    },
    {
        'url':    'https://www.jeuneafrique.com/feed/',
        'source': 'Jeune Afrique',
        'color':  '#d4af37',
        'strict': True,
    },
    {
        'url':    'https://www.lemonde.fr/afrique/rss_full.xml',
        'source': 'Le Monde Afrique',
        'color':  '#1a1a2e',
        'strict': True,
    },
    # Presse béninoise (filtrage modéré)
    {
        'url':    'https://www.24haubenin.info/?feed=rss2',
        'source': '24h au Bénin',
        'color':  '#008751',
        'strict': True,
    },
    {
        'url':    'https://lanouvelletribune.info/feed/',
        'source': 'Nouvelle Tribune Bénin',
        'color':  '#cc0000',
        'strict': True,
    },
    # Sécurité alimentaire Afrique de l'Ouest
    {
        'url':    'https://www.sosfaim.be/rss/',
        'source': 'SOS Faim',
        'color':  '#f77f00',
        'strict': False,
    },
]

# Images de secours contextuelles par mot-clé
IMAGES_CONTEXTE = {
    'maïs':      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
    'mais':      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
    'riz':       'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    'soja':      'https://images.unsplash.com/photo-1599579773853-3b3e1b43f7d5?w=800&q=80',
    'mil':       'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'sorgho':    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'arachide':  'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80',
    'irrigation':'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800&q=80',
    'coopérative':'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'engrais':   'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'récolte':   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'default':   'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
}


def _clean(text):
    """Décode les entités HTML et enlève les balises."""
    if not text:
        return ''
    text = html.unescape(text)                  # &#8217; → '
    text = re.sub(r'<[^>]+>', ' ', text)        # enlève les balises HTML
    text = re.sub(r'\s+', ' ', text).strip()    # normalise les espaces
    return text


def _extract_image(item_elem):
    """Extrait l'URL d'image d'un item RSS."""
    # media:content / media:thumbnail
    for tag in [
        '{http://search.yahoo.com/mrss/}content',
        '{http://search.yahoo.com/mrss/}thumbnail',
    ]:
        el = item_elem.find(tag)
        if el is not None:
            url = el.get('url', '')
            if url.startswith('http') and any(e in url.lower() for e in ['.jpg', '.jpeg', '.png', '.webp', 'image']):
                return url

    # enclosure
    enc = item_elem.find('enclosure')
    if enc is not None:
        url = enc.get('url', '')
        if url.startswith('http') and any(e in url.lower() for e in ['.jpg', '.jpeg', '.png', '.webp']):
            return url

    # img dans description HTML
    for tag in ['description', '{http://purl.org/rss/1.0/modules/content/}encoded']:
        el = item_elem.find(tag)
        if el is not None and el.text:
            m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', el.text)
            if m:
                url = m.group(1)
                if url.startswith('http'):
                    return url
    return None


def _fallback_image(titre):
    """Choisit une image de secours cohérente avec le sujet."""
    titre_lower = titre.lower()
    for keyword, url in IMAGES_CONTEXTE.items():
        if keyword in titre_lower:
            return url
    return IMAGES_CONTEXTE['default']


def _parse_date(date_str):
    if not date_str:
        return datetime.now(timezone.utc)
    try:
        return parsedate_to_datetime(date_str.strip())
    except Exception:
        for fmt in ('%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%dT%H:%M:%S%z'):
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
    return datetime.now(timezone.utc)


def _est_pertinent(titre, description, strict=True):
    """Vérifie si l'article est agricole/alimentaire."""
    texte = (titre + ' ' + description).lower()

    # Exclure immédiatement les sujets hors-champ
    for exclu in KEYWORDS_EXCLUS:
        if exclu in texte:
            return False

    if not strict:
        return True  # Sources déjà spécialisées agriculture

    # Pour les sources généralistes : exiger au moins 1 mot-clé agricole
    return any(kw in texte for kw in KEYWORDS_REQUIS)


def fetch_rss(source_info):
    articles = []
    try:
        resp = requests.get(source_info['url'], headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        root    = ET.fromstring(resp.content)
        channel = root.find('channel') or root
        items   = channel.findall('item')

        for item in items[:30]:
            titre_el  = item.find('title')
            desc_el   = item.find('description')
            link_el   = item.find('link')
            date_el   = item.find('pubDate') or item.find('{http://purl.org/dc/elements/1.1/}date')

            titre = _clean(titre_el.text  if titre_el is not None  else '')
            desc  = _clean(desc_el.text   if desc_el  is not None  else '')
            lien  = (link_el.text or '').strip() if link_el is not None else ''
            date_str = (date_el.text or '').strip() if date_el is not None else ''

            if not titre or not lien:
                continue

            if not _est_pertinent(titre, desc, strict=source_info.get('strict', True)):
                continue

            image    = _extract_image(item) or _fallback_image(titre)
            date_obj = _parse_date(date_str)

            articles.append({
                'id':           hashlib.md5(f"{source_info['source']}:{titre}".encode()).hexdigest()[:12],
                'titre':        titre,
                'extrait':      desc[:280] if desc else f'Lire sur {source_info["source"]}',
                'lien':         lien,
                'image':        image,
                'source':       source_info['source'],
                'source_color': source_info['color'],
                'date':         date_obj.strftime('%d %b %Y'),
                'date_iso':     date_obj.isoformat(),
                'externe':      True,
            })

    except Exception:
        pass
    return articles


def get_all_news(max_total=40):
    all_articles = []
    for source in RSS_SOURCES:
        all_articles.extend(fetch_rss(source))

    # Dédoublonnage
    seen, unique = set(), []
    for a in all_articles:
        key = re.sub(r'\s+', ' ', a['titre'].lower())[:60]
        if key not in seen:
            seen.add(key)
            unique.append(a)

    unique.sort(key=lambda x: x.get('date_iso', ''), reverse=True)
    return unique[:max_total]
