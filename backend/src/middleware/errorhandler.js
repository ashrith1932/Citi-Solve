import multer from 'multer';

export const multerErrorHandler = (err, req, res, next) => {

  if (err instanceof multer.MulterError) {
    const messages = {
      'LIMIT_FILE_SIZE': 'File too large. Maximum size is 5MB',
      'LIMIT_FILE_COUNT': 'Too many files. Maximum is 5 images',
      'LIMIT_UNEXPECTED_FILE': 'Unexpected field name for file upload'
    };
    
    return res.status(400).json({
      success: false,
      error: messages[err.code] || err.message
    });
  }
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next(err);
};