from app.config import settings
print(f"Has database_url: {hasattr(settings, 'database_url')}")
print(f"Has database_url_internal: {hasattr(settings, 'database_url_internal')}")
print(f"Settings fields: {settings.__dict__.keys()}")
