import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from PIL import Image

# Allowed file extensions and MIME types
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
ALLOWED_DOCUMENT_EXTENSIONS = {'pdf'}
ALLOWED_IMAGE_MIMES = {'image/jpeg', 'image/png', 'image/jpg'}
ALLOWED_DOCUMENT_MIMES = {'application/pdf'}

# Maximum file sizes (in bytes)
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file, field_name):
    """Validate uploaded file"""
    try:
        if not file or file.filename == '':
            return {'valid': False, 'error': 'No file selected'}
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        max_size = MAX_DOCUMENT_SIZE if field_name == 'paymentReceipt' else MAX_IMAGE_SIZE
        if file_size > max_size:
            max_size_mb = max_size / (1024 * 1024)
            return {'valid': False, 'error': f'File size exceeds {max_size_mb}MB limit'}
        
        # Check file extension
        filename = secure_filename(file.filename)
        if '.' not in filename:
            return {'valid': False, 'error': 'File must have an extension'}
        
        extension = filename.rsplit('.', 1)[1].lower()
        
        if field_name == 'paymentReceipt':
            allowed_extensions = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOCUMENT_EXTENSIONS
        else:
            allowed_extensions = ALLOWED_IMAGE_EXTENSIONS
        
        if extension not in allowed_extensions:
            return {'valid': False, 'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}
        
        # Basic MIME type check
        mime_type = get_mime_from_extension(extension)
        
        if field_name == 'paymentReceipt':
            allowed_mimes = ALLOWED_IMAGE_MIMES | ALLOWED_DOCUMENT_MIMES
        else:
            allowed_mimes = ALLOWED_IMAGE_MIMES
        
        if mime_type not in allowed_mimes:
            return {'valid': False, 'error': f'Invalid file content. Expected: {", ".join(allowed_mimes)}'}
        
        # Additional validation for images
        if mime_type.startswith('image/'):
            try:
                # Verify it's a valid image
                image = Image.open(file)
                image.verify()
                file.seek(0)  # Reset file pointer after verification
            except Exception as e:
                print(f"Image verification warning (continuing anyway): {e}")
                file.seek(0)  # Reset file pointer even if verification fails
        
        return {'valid': True}
        
    except Exception as e:
        return {'valid': False, 'error': f'File validation error: {str(e)}'}

def handle_file_upload(file, field_name):
    """Handle file upload and save to disk"""
    try:
        # Validate file first
        validation = validate_file(file, field_name)
        if not validation['valid']:
            return {'success': False, 'error': validation['error']}
        
        # Reset file pointer before saving
        file.seek(0)
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
        unique_filename = f"{field_name}_{uuid.uuid4().hex[:8]}.{extension}"
        
        # Save file
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(upload_path)
        
        # Set proper file permissions
        os.chmod(upload_path, 0o644)
        
        # Optimize image if it's an image file
        if extension in ALLOWED_IMAGE_EXTENSIONS:
            try:
                optimize_image(upload_path)
            except Exception as e:
                print(f"Image optimization warning: {e}")
                # Continue even if optimization fails
        
        return {
            'success': True,
            'filename': unique_filename,
            'original_filename': filename,
            'size': os.path.getsize(upload_path)
        }
        
    except Exception as e:
        print(f"Upload error: {e}")
        return {'success': False, 'error': f'Upload failed: {str(e)}'}

def optimize_image(file_path):
    """Optimize image file size and quality"""
    try:
        with Image.open(file_path) as image:
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large
            max_dimension = 1920
            if max(image.size) > max_dimension:
                image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            
            # Save with optimization
            image.save(file_path, 'JPEG', quality=85, optimize=True)
            
    except Exception as e:
        print(f"Image optimization failed: {e}")

def get_mime_from_extension(extension):
    """Get MIME type from file extension"""
    mime_map = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'pdf': 'application/pdf'
    }
    return mime_map.get(extension.lower(), 'application/octet-stream')

def delete_file(filename):
    """Delete uploaded file"""
    try:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {filename}: {e}")
        return False

def get_file_url(filename):
    """Get URL for uploaded file"""
    site_url = os.getenv('SITE_URL', 'http://localhost:5000')
    return f"{site_url}/uploads/{filename}"