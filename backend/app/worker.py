import os
from celery import Celery
from app.config import settings

# Celery configuration
app = Celery(
    'lectureai',
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=['app.tasks.parse_slides', 'app.tasks.generate_script', 'app.tasks.generate_voice', 'app.tasks.render_video']
)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max
    worker_max_tasks_per_child=50,
    worker_prefetch_multiplier=1,
)


if __name__ == '__main__':
    app.start()
