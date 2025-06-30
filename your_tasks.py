import math
import numpy as np

def prime_calculation(n: int):
    """ترجع قائمة الأعداد الأوليّة حتى n مع عددها"""
    primes = []
    for num in range(2, n + 1):
        if all(num % p != 0 for p in range(2, int(math.sqrt(num)) + 1)):
            primes.append(num)
    return {"count": len(primes), "primes": primes}

def matrix_multiply(size: int):
    """ضرب مصفوفات عشوائيّة (size × size)"""
    A = np.random.rand(size, size)
    B = np.random.rand(size, size)
    result = np.dot(A, B)  # يمكن أيضًا: A @ B
    return {"result": result.tolist()}

def data_processing(data_size: int):
    """تنفيذ معالجة بيانات بسيطة كتجربة"""
    data = np.random.rand(data_size)
    mean = np.mean(data)
    std_dev = np.std(data)
    return {"mean": mean, "std_dev": std_dev}

from offload_lib import offload

@offload
def complex_operation(x):
    """مهمة معقدة قابلة للتوزيع"""
    result = 0
    for i in range(x * 1000):
        result += i ** 2
    return result

@offload
def data_processing(size):
    """معالجة بيانات كبيرة"""
    import time
    time.sleep(size / 10000)  # محاكاة معالجة
    return {"processed": size, "status": "completed"}

@offload
def matrix_multiply(size):
    """ضرب المصفوفات"""
    import numpy as np
    A = np.random.rand(size, size)
    B = np.random.rand(size, size)
    return np.dot(A, B)

@offload
def prime_calculation(n):
    """حساب الأعداد الأولية"""
    primes = []
    for num in range(2, n + 1):
        for i in range(2, int(num**0.5) + 1):
            if num % i == 0:
                break
        else:
            primes.append(num)
    return len(primes)

# مهام معالجة الفيديو والألعاب ثلاثية الأبعاد
@offload
def video_format_conversion(duration_seconds, quality_level, input_format="mp4", output_format="avi"):
    """تحويل صيغة الفيديو - مهمة قابلة للتوزيع"""
    from video_processing import video_format_conversion as vfc
    return vfc(duration_seconds, quality_level, input_format, output_format)

@offload
def video_effects_processing(video_length, effects_count, resolution="1080p"):
    """معالجة تأثيرات الفيديو - مهمة قابلة للتوزيع"""
    from video_processing import video_effects_processing as vep
    return vep(video_length, effects_count, resolution)

@offload
def render_3d_scene(objects_count, resolution_width, resolution_height, lighting_quality="medium", texture_quality="high"):
    """رندر مشهد ثلاثي الأبعاد - مهمة قابلة للتوزيع"""
    from video_processing import render_3d_scene as r3d
    return r3d(objects_count, resolution_width, resolution_height, lighting_quality, texture_quality)

@offload
def physics_simulation(objects_count, frames_count, physics_quality="medium"):
    """محاكاة الفيزياء - مهمة قابلة للتوزيع"""
    from video_processing import physics_simulation as ps
    return ps(objects_count, frames_count, physics_quality)

@offload
def game_ai_processing(ai_agents_count, decision_complexity, game_state_size):
    """معالجة ذكاء اصطناعي للألعاب - مهمة قابلة للتوزيع"""
    from video_processing import game_ai_processing as gap
    return gap(ai_agents_count, decision_complexity, game_state_size)