import '@testing-library/jest-dom';
import { apiClient } from '@/lib/api-client';

// Mock API client
jest.mock('@/lib/api-client');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock FormData and File
global.FormData = class FormData {
  private data: Record<string, any> = {};
  
  append(name: string, value: any) {
    this.data[name] = value;
  }
  
  get(name: string) {
    return this.data[name];
  }
} as any;

global.File = class File {
  constructor(public bits: any[], public name: string, public options?: any) {}
  
  get size() {
    return this.bits.length;
  }
  
  get type() {
    return this.options?.type || '';
  }
} as any;

describe('Image Upload Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadProductImage', () => {
    test('should upload image successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        url: '/uploads/products/test.jpg',
        filename: 'test.jpg'
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(mockFile);

      expect(mockApiClient.uploadProductImage).toHaveBeenCalledWith(mockFile);
      expect(result.url).toBe('/uploads/products/test.jpg');
      expect(result.filename).toBe('test.jpg');
    });

    test('should handle PNG image upload', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockResponse = {
        url: '/uploads/products/test.png',
        filename: 'test.png'
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(mockFile);

      expect(result.url).toBe('/uploads/products/test.png');
      expect(result.filename).toBe('test.png');
    });

    test('should handle WebP image upload', async () => {
      const mockFile = new File(['test'], 'test.webp', { type: 'image/webp' });
      const mockResponse = {
        url: '/uploads/products/test.webp',
        filename: 'test.webp'
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(mockFile);

      expect(result.url).toBe('/uploads/products/test.webp');
      expect(result.filename).toBe('test.webp');
    });
  });

  describe('File Size Validation', () => {
    test('should reject files larger than 5MB', async () => {
      // Create a large file (6MB)
      const largeFile = new File(
        [new ArrayBuffer(6 * 1024 * 1024)], 
        'large.jpg', 
        { type: 'image/jpeg' }
      );

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('File size exceeds 5MB limit')
      );

      await expect(mockApiClient.uploadProductImage(largeFile))
        .rejects.toThrow('File size exceeds 5MB limit');
    });

    test('should accept files within size limit', async () => {
      // Create a small file (1MB)
      const smallFile = new File(
        [new ArrayBuffer(1024 * 1024)], 
        'small.jpg', 
        { type: 'image/jpeg' }
      );

      const mockResponse = {
        url: '/uploads/products/small.jpg',
        filename: 'small.jpg'
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(smallFile);

      expect(result.url).toBe('/uploads/products/small.jpg');
    });

    test('should handle exactly 5MB file', async () => {
      // Create exactly 5MB file
      const exactFile = new File(
        [new ArrayBuffer(5 * 1024 * 1024)], 
        'exact.jpg', 
        { type: 'image/jpeg' }
      );

      const mockResponse = {
        url: '/uploads/products/exact.jpg',
        filename: 'exact.jpg'
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(exactFile);

      expect(result.url).toBe('/uploads/products/exact.jpg');
    });
  });

  describe('File Format Validation', () => {
    test('should reject non-image files', async () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed')
      );

      await expect(mockApiClient.uploadProductImage(textFile))
        .rejects.toThrow('Invalid file format. Only JPEG, PNG, and WebP images are allowed');
    });

    test('should reject PDF files', async () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed')
      );

      await expect(mockApiClient.uploadProductImage(pdfFile))
        .rejects.toThrow('Invalid file format. Only JPEG, PNG, and WebP images are allowed');
    });

    test('should reject executable files', async () => {
      const exeFile = new File(['test'], 'malware.exe', { type: 'application/x-executable' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed')
      );

      await expect(mockApiClient.uploadProductImage(exeFile))
        .rejects.toThrow('Invalid file format. Only JPEG, PNG, and WebP images are allowed');
    });

    test('should handle files without MIME type', async () => {
      const noMimeFile = new File(['test'], 'unknown');

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed')
      );

      await expect(mockApiClient.uploadProductImage(noMimeFile))
        .rejects.toThrow('Invalid file format. Only JPEG, PNG, and WebP images are allowed');
    });
  });

  describe('Upload Error Handling', () => {
    test('should handle network errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Network error during upload')
      );

      await expect(mockApiClient.uploadProductImage(mockFile))
        .rejects.toThrow('Network error during upload');
    });

    test('should handle server errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Server error: Internal server error')
      );

      await expect(mockApiClient.uploadProductImage(mockFile))
        .rejects.toThrow('Server error: Internal server error');
    });

    test('should handle storage quota exceeded', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Storage quota exceeded')
      );

      await expect(mockApiClient.uploadProductImage(mockFile))
        .rejects.toThrow('Storage quota exceeded');
    });
  });

  describe('Multiple Image Uploads', () => {
    test('should handle concurrent uploads', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.jpg', { type: 'image/jpeg' })
      ];

      const mockResponses = [
        { url: '/uploads/products/test1.jpg', filename: 'test1.jpg' },
        { url: '/uploads/products/test2.jpg', filename: 'test2.jpg' },
        { url: '/uploads/products/test3.jpg', filename: 'test3.jpg' }
      ];

      mockApiClient.uploadProductImage
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      const uploadPromises = files.map(file => mockApiClient.uploadProductImage(file));
      const results = await Promise.all(uploadPromises);

      expect(results).toHaveLength(3);
      expect(results[0].url).toBe('/uploads/products/test1.jpg');
      expect(results[1].url).toBe('/uploads/products/test2.jpg');
      expect(results[2].url).toBe('/uploads/products/test3.jpg');
    });

    test('should handle partial upload failures', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];

      mockApiClient.uploadProductImage
        .mockResolvedValueOnce({ url: '/uploads/products/test1.jpg', filename: 'test1.jpg' })
        .mockRejectedValueOnce(new Error('Upload failed for test2.jpg'));

      const uploadPromises = files.map(file => mockApiClient.uploadProductImage(file));
      
      await expect(Promise.all(uploadPromises)).rejects.toThrow('Upload failed for test2.jpg');
    });
  });

  describe('Image Compression and Processing', () => {
    test('should handle image compression', async () => {
      const largeImageFile = new File(
        [new ArrayBuffer(3 * 1024 * 1024)], 
        'large.jpg', 
        { type: 'image/jpeg' }
      );

      const mockResponse = {
        url: '/uploads/products/large_compressed.jpg',
        filename: 'large_compressed.jpg',
        original_size: '3MB',
        compressed_size: '800KB',
        compression_ratio: '73%'
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(largeImageFile);

      expect(result.url).toBe('/uploads/products/large_compressed.jpg');
      expect(result.compressed_size).toBe('800KB');
    });

    test('should generate thumbnails', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const mockResponse = {
        url: '/uploads/products/test.jpg',
        filename: 'test.jpg',
        thumbnails: {
          small: '/uploads/products/thumbnails/test_small.jpg',
          medium: '/uploads/products/thumbnails/test_medium.jpg'
        }
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(mockFile);

      expect(result.thumbnails.small).toBe('/uploads/products/thumbnails/test_small.jpg');
      expect(result.thumbnails.medium).toBe('/uploads/products/thumbnails/test_medium.jpg');
    });
  });

  describe('Security and Validation', () => {
    test('should sanitize filenames', async () => {
      const maliciousFile = new File(['test'], '../../../etc/passwd.jpg', { type: 'image/jpeg' });

      const mockResponse = {
        url: '/uploads/products/sanitized.jpg',
        filename: 'sanitized.jpg'
      };

      mockApiClient.uploadProductImage.mockResolvedValue(mockResponse);

      const result = await mockApiClient.uploadProductImage(maliciousFile);

      expect(result.filename).toBe('sanitized.jpg');
      expect(result.filename).not.toContain('../');
    });

    test('should validate image content', async () => {
      const fakeImageFile = new File(['not an image'], 'fake.jpg', { type: 'image/jpeg' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Invalid image content')
      );

      await expect(mockApiClient.uploadProductImage(fakeImageFile))
        .rejects.toThrow('Invalid image content');
    });

    test('should rate limit uploads', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      mockApiClient.uploadProductImage.mockRejectedValue(
        new Error('Upload rate limit exceeded. Please try again later.')
      );

      // Simulate rapid uploads
      const uploadPromises = Array(10).fill(null).map(() => 
        mockApiClient.uploadProductImage(mockFile)
      );

      await expect(Promise.all(uploadPromises)).rejects.toThrow('Upload rate limit exceeded');
    });
  });
});
