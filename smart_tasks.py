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

