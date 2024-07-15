# theme_management.py

class ThemeManager:
    def __init__(self):
        self.themes = {}

    def set_theme(self, streamer_name, theme):
        self.themes[streamer_name] = theme

    def get_theme(self, streamer_name):
        return self.themes.get(streamer_name)

    def remove_theme(self, streamer_name):
        if streamer_name in self.themes:
            del self.themes[streamer_name]
