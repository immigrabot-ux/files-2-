import requests
from typing import Dict, Optional
from loguru import logger
from app.config import settings


class TeachableIntegration:
    """Integration with Teachable LMS"""

    def __init__(self, api_key: str, school_domain: str):
        self.api_key = api_key
        self.base_url = f"https://{school_domain}/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def upload_video(self, course_id: str, lecture_id: str, video_url: str, title: str) -> Dict:
        """Upload video to Teachable course"""
        try:
            response = requests.post(
                f"{self.base_url}/courses/{course_id}/lectures/{lecture_id}/video",
                headers=self.headers,
                json={
                    "video_url": video_url,
                    "title": title
                }
            )
            response.raise_for_status()
            logger.info(f"Video uploaded to Teachable: {title}")
            return {"success": True, "data": response.json()}

        except Exception as exc:
            logger.error(f"Teachable upload error: {str(exc)}")
            return {"success": False, "error": str(exc)}

    def get_courses(self) -> Dict:
        """Get list of courses"""
        try:
            response = requests.get(
                f"{self.base_url}/courses",
                headers=self.headers
            )
            response.raise_for_status()
            return {"success": True, "data": response.json()}

        except Exception as exc:
            logger.error(f"Teachable get courses error: {str(exc)}")
            return {"success": False, "error": str(exc)}


class ThinkificIntegration:
    """Integration with Thinkific LMS"""

    def __init__(self, api_key: str, subdomain: str):
        self.api_key = api_key
        self.base_url = f"https://api.thinkific.com/api/public/v1"
        self.headers = {
            "X-Auth-API-Key": api_key,
            "X-Auth-Subdomain": subdomain,
            "Content-Type": "application/json"
        }

    def upload_video(self, course_id: str, chapter_id: str, video_url: str, title: str) -> Dict:
        """Upload video to Thinkific course"""
        try:
            # Create lesson
            response = requests.post(
                f"{self.base_url}/courses/{course_id}/chapters/{chapter_id}/lessons",
                headers=self.headers,
                json={
                    "name": title,
                    "lesson_type": "video",
                    "video_url": video_url
                }
            )
            response.raise_for_status()
            logger.info(f"Video uploaded to Thinkific: {title}")
            return {"success": True, "data": response.json()}

        except Exception as exc:
            logger.error(f"Thinkific upload error: {str(exc)}")
            return {"success": False, "error": str(exc)}

    def get_courses(self) -> Dict:
        """Get list of courses"""
        try:
            response = requests.get(
                f"{self.base_url}/courses",
                headers=self.headers
            )
            response.raise_for_status()
            return {"success": True, "data": response.json()}

        except Exception as exc:
            logger.error(f"Thinkific get courses error: {str(exc)}")
            return {"success": False, "error": str(exc)}


class KajabiIntegration:
    """Integration with Kajabi LMS"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.kajabi.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def upload_video(self, product_id: str, post_id: str, video_url: str, title: str) -> Dict:
        """Upload video to Kajabi product"""
        try:
            # Update post with video
            response = requests.put(
                f"{self.base_url}/posts/{post_id}",
                headers=self.headers,
                json={
                    "title": title,
                    "video_url": video_url,
                    "status": "published"
                }
            )
            response.raise_for_status()
            logger.info(f"Video uploaded to Kajabi: {title}")
            return {"success": True, "data": response.json()}

        except Exception as exc:
            logger.error(f"Kajabi upload error: {str(exc)}")
            return {"success": False, "error": str(exc)}

    def get_products(self) -> Dict:
        """Get list of products"""
        try:
            response = requests.get(
                f"{self.base_url}/products",
                headers=self.headers
            )
            response.raise_for_status()
            return {"success": True, "data": response.json()}

        except Exception as exc:
            logger.error(f"Kajabi get products error: {str(exc)}")
            return {"success": False, "error": str(exc)}


def get_lms_integration(platform: str, credentials: Dict):
    """Factory function to get LMS integration instance"""
    if platform == "teachable":
        return TeachableIntegration(
            api_key=credentials.get("api_key"),
            school_domain=credentials.get("school_domain")
        )
    elif platform == "thinkific":
        return ThinkificIntegration(
            api_key=credentials.get("api_key"),
            subdomain=credentials.get("subdomain")
        )
    elif platform == "kajabi":
        return KajabiIntegration(
            api_key=credentials.get("api_key")
        )
    else:
        raise ValueError(f"Unsupported LMS platform: {platform}")
