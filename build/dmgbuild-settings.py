# dmgbuild settings — CLACOROO (DMG installer 720x460 stile HyperWhisper)
# Sostituisce electron-builder DMG che su macOS Sequoia ha bug noto con .DS_Store.

import os.path

application = defines.get('app', 'dist/mac-arm64/CLACOROO.app')
appname = os.path.basename(application)

format = 'UDZO'
size = None
files = [application]
symlinks = {'Applications': '/Applications'}

background = 'build/dmg-background.png'
icon = 'assets/icon.icns'

# Icone grandi 128px, centro y=311 (allineate alla freccia).
# Spacing app(160) <-> Apps(560) = 400px → freccia lunga 240px in mezzo.
icon_locations = {
    appname:        (160, 311),
    'Applications': (560, 311),
}

# Window 720×520: 460 background + ~60 chrome Finder (title + status bar).
window_rect = ((100, 100), (720, 520))
default_view = 'icon-view'
show_icon_preview = False
show_status_bar = False
show_toolbar = False
show_pathbar = False
show_sidebar = False
show_tab_view = False

icon_size = 128
text_size = 13
include_icon_view_settings = True

license = None
