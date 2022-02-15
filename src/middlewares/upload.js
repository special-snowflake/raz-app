const multer = require('multer');
const path = require('path');

const maxfilesize = 2 * 1024 * 1024;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'media/images/');
  },
  filename: (req, file, cb) => {
    const {payload} = req;
    const id = payload.id;
    const fileName = `${file.fieldname}-${id}-${Date.now()}${path.extname(
      file.originalname,
    )}`;
    cb(null, fileName);
  },
});

const multerOption = {
  storage,
  fileFilter: (req, file, cb) => {
    req.isPassFilter = true;
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb((req.isPassFilter = false));
    }
  },
  limits: {fileSize: maxfilesize},
};

const upload = multer(multerOption).single('profilePicture');
const multerHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
        console.log('error found', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            errMsg: `Image size mustn't be bigger than 2MB!`,
            err: err.code,
          });
        }
        if (err.code === 'WRONG_EXSTENSION') {
          return res.status(400).json({
            errMsg: `Only .png, .jpg and .jpeg format allowed!`,
            err: err.code,
          });
        }
        return res.status(500).json({
          errMsg: `Something went wrong.`,
          err,
        });
      }
      const images = getImagePath(req.files);
      req.images = images;
      next();
  });
};

module.exports = multerHandler;