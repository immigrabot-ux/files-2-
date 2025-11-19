import boto3
from botocore.exceptions import ClientError
from app.config import settings
from loguru import logger
from typing import Optional
import mimetypes


s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region
)


def upload_file(
    file_data: bytes,
    file_name: str,
    folder: str = "uploads",
    content_type: Optional[str] = None
) -> str:
    """
    Upload file to S3.

    Args:
        file_data: File content as bytes
        file_name: Name of the file
        folder: S3 folder/prefix
        content_type: MIME type (auto-detected if not provided)

    Returns:
        S3 URL of uploaded file
    """
    try:
        key = f"{folder}/{file_name}"

        if not content_type:
            content_type, _ = mimetypes.guess_type(file_name)
            if not content_type:
                content_type = 'application/octet-stream'

        s3_client.put_object(
            Bucket=settings.aws_s3_bucket,
            Key=key,
            Body=file_data,
            ContentType=content_type
        )

        url = f"https://{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{key}"
        logger.info(f"Uploaded file to S3: {url}")

        return url

    except ClientError as exc:
        logger.error(f"S3 upload error: {str(exc)}")
        raise


def download_file(url: str) -> bytes:
    """
    Download file from S3.

    Args:
        url: S3 URL of the file

    Returns:
        File content as bytes
    """
    try:
        # Extract key from URL
        key = url.split(f"{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/")[1]

        response = s3_client.get_object(
            Bucket=settings.aws_s3_bucket,
            Key=key
        )

        return response['Body'].read()

    except ClientError as exc:
        logger.error(f"S3 download error: {str(exc)}")
        raise


def delete_file(url: str) -> bool:
    """
    Delete file from S3.

    Args:
        url: S3 URL of the file

    Returns:
        True if successful
    """
    try:
        key = url.split(f"{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/")[1]

        s3_client.delete_object(
            Bucket=settings.aws_s3_bucket,
            Key=key
        )

        logger.info(f"Deleted file from S3: {url}")
        return True

    except ClientError as exc:
        logger.error(f"S3 delete error: {str(exc)}")
        raise


def generate_presigned_url(key: str, expiration: int = 3600) -> str:
    """
    Generate presigned URL for temporary access.

    Args:
        key: S3 object key
        expiration: URL expiration time in seconds

    Returns:
        Presigned URL
    """
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.aws_s3_bucket,
                'Key': key
            },
            ExpiresIn=expiration
        )

        return url

    except ClientError as exc:
        logger.error(f"S3 presigned URL error: {str(exc)}")
        raise
