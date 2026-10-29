"""Environment for the Socket Mode Slack bot."""

import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    def __init__(self) -> None:
        self.port = int(os.environ.get("PORT", "3000"))
        self.bot_token = os.environ.get("SLACK_BOT_TOKEN", "")
        self.app_token = os.environ.get("SLACK_APP_TOKEN", "")
        self.agent_url = os.environ.get("SRE_AGENT_URL", "http://localhost:8000")
        self.auth_token = os.environ.get("INVESTIGATE_AUTH_TOKEN", "")
        self.web_ui = (
            os.environ.get("WEB_UI_PUBLIC_BASE_URL")
            or os.environ.get("WEB_UI_URL")
            or ""
        )

    def is_configured(self) -> bool:
        return bool(self.bot_token and self.app_token)
