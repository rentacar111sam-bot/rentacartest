from flask import Blueprint, send_file, jsonify
import os

apk_bp = Blueprint('apk', __name__)

@apk_bp.route('/download', methods=['GET'])
def download_apk():
    """APK faylni yuklab berish"""
    try:
        # APK fayl yo'li
        apk_path = os.path.join(os.getcwd(), 'apk', 'rentcar.apk')
        
        # Fayl mavjudligini tekshirish
        if not os.path.exists(apk_path):
            return jsonify({'error': 'APK fayl topilmadi'}), 404
        
        # Faylni yuborish
        return send_file(
            apk_path,
            mimetype='application/vnd.android.package-archive',
            as_attachment=True,
            download_name='RentCar.apk'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@apk_bp.route('/info', methods=['GET'])
def apk_info():
    """APK fayl haqida ma'lumot"""
    try:
        apk_path = os.path.join(os.getcwd(), 'apk', 'rentcar.apk')
        
        if not os.path.exists(apk_path):
            return jsonify({
                'exists': False,
                'message': 'APK fayl topilmadi'
            }), 404
        
        # Fayl hajmini olish
        file_size = os.path.getsize(apk_path)
        file_size_mb = round(file_size / (1024 * 1024), 2)
        
        return jsonify({
            'exists': True,
            'size': file_size,
            'size_mb': file_size_mb,
            'filename': 'rentcar.apk',
            'download_url': '/api/apk/download'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
