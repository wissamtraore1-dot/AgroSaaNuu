"""
Récupération et parsing de flux RSS — actualités agricoles Bénin / Afrique de l'Ouest.
Utilise feedparser (bien meilleure extraction d'images et compatibilité RSS/Atom).
"""
import re
import html
import hashlib
import feedparser
from datetime import datetime, timezone
from time import mktime

TIMEOUT = 8
feedparser.USER_AGENT = 'AgroSaaNuu/1.0 +https://agrosaanuu.com'

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
    'maïs':        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
    'mais':        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
    'riz':         'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    'soja':        'https://images.unsplash.com/photo-1599579773853-3b3e1b43f7d5?w=800&q=80',
    'mil':         'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'sorgho':      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'arachide':    'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80',
    'irrigation':  'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800&q=80',
    'coopérative': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'cooperative': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'engrais':     'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'fertilisant': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'récolte':     'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'marché':      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    'marche':      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    'haricot':     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'niébé':       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'manioc':      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80',
    'coton':       'https://images.unsplash.com/photo-1535540878298-b9897bed1ad9?w=800&q=80',
    'élevage':     'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80',
    'pêche':       'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=800&q=80',
    'bénin':       'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&q=80',
    'benin':       'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&q=80',
    'afrique':     'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80',
    'paysan':      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    'agriculteur': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    'fao':         'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'alimentaire': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
}

# Pool d'images de secours variées (utilisées quand aucun mot-clé ne correspond)
IMAGES_DEFAUT = [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&q=80',
    'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80',
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    'https://images.unsplash.com/photo-1535540878298-b9897bed1ad9?w=800&q=80',
]


def _clean(text):
    """Décode les entités HTML et enlève les balises."""
    if not text:
        return ''
    text = html.unescape(text)                  # &#8217; → '
    text = re.sub(r'<[^>]+>', ' ', text)        # enlève les balises HTML
    text = re.sub(r'\s+', ' ', text).strip()    # normalise les espaces
    return text


def _extract_image_entry(entry):
    """
    Extrait l'URL d'image d'un article feedparser (meilleure compatibilité).
    Feedparser normalise déjà media:content, enclosures, etc.
    """
    # 1. media_content (media:content) — le plus courant
    for m in getattr(entry, 'media_content', []):
        url = m.get('url', '')
        if url.startswith('http') and any(e in url.lower() for e in ['.jpg', '.jpeg', '.png', '.webp', '.gif', 'image']):
            return url

    # 2. media_thumbnail (media:thumbnail)
    for m in getattr(entry, 'media_thumbnail', []):
        url = m.get('url', '')
        if url.startswith('http'):
            return url

    # 3. enclosures (podcasts et sites news)
    for enc in getattr(entry, 'enclosures', []):
        url  = enc.get('url', '')
        typ  = enc.get('type', '')
        if url.startswith('http') and ('image' in typ or any(e in url.lower() for e in ['.jpg', '.jpeg', '.png', '.webp'])):
            return url

    # 4. img dans content ou summary (HTML brut)
    for field in ['content', 'summary']:
        val = entry.get(field)
        if isinstance(val, list):
            val = val[0].get('value', '') if val else ''
        txt = val or ''
        if txt:
            m = re.search(r'<img[^>]+src=["\']([^"\']{10,})["\']', txt, re.IGNORECASE)
            if m:
                url = html.unescape(m.group(1))
                if url.startswith('http'):
                    return url

    return None


def _fallback_image(titre, article_id=''):
    """
    Choisit une image de secours cohérente avec le sujet.
    Si aucun mot-clé ne correspond, utilise le hash de l'id pour
    varier les images et éviter que tous les articles aient la même.
    """
    titre_lower = titre.lower()
    for keyword, url in IMAGES_CONTEXTE.items():
        if keyword in titre_lower:
            return url
    idx = int(hashlib.md5(article_id.encode()).hexdigest(), 16) % len(IMAGES_DEFAUT)
    return IMAGES_DEFAUT[idx]


def _parse_date_struct(time_struct):
    """Convertit un time.struct_time feedparser en datetime UTC."""
    if time_struct:
        try:
            return datetime.fromtimestamp(mktime(time_struct), tz=timezone.utc)
        except Exception:
            pass
    return datetime.now(timezone.utc)


def _est_pertinent(titre, description, strict=True):
    """Vérifie si l'article est agricole/alimentaire."""
    texte = (titre + ' ' + description).lower()
    for exclu in KEYWORDS_EXCLUS:
        if exclu in texte:
            return False
    if not strict:
        return True
    return any(kw in texte for kw in KEYWORDS_REQUIS)


def fetch_rss(source_info):
    """Parse un flux RSS avec feedparser — gère RSS 1.0/2.0 et Atom."""
    articles = []
    try:
        feed = feedparser.parse(
            source_info['url'],
            request_headers={'User-Agent': 'AgroSaaNuu/1.0'},
            timeout=TIMEOUT,
        )
        if feed.bozo and not feed.entries:
            return articles

        for entry in feed.entries[:30]:
            titre = _clean(entry.get('title', ''))
            desc  = _clean(entry.get('summary', '') or entry.get('description', ''))
            lien  = entry.get('link', '').strip()

            if not titre or not lien:
                continue
            if not _est_pertinent(titre, desc, strict=source_info.get('strict', True)):
                continue

            article_id = hashlib.md5(f"{source_info['source']}:{titre}".encode()).hexdigest()[:12]
            image      = _extract_image_entry(entry) or _fallback_image(titre, article_id)
            date_obj   = _parse_date_struct(entry.get('published_parsed') or entry.get('updated_parsed'))

            articles.append({
                'id':           article_id,
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
