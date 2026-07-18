import { Request } from "express";
import multer from "multer";
import { fileTypeEnum, store_Enum } from "../enum/multer.enum";
import { tmpdir } from "node:os";

const multerCloud = ({
  store_Type = store_Enum.memory,
  fileType = fileTypeEnum.image,
  maxSize = 1024 * 1024 * 5,
}: { store_Type?: store_Enum; fileType?: string[]; maxSize?: number } = {}) => {
  const storage =
    store_Type === store_Enum.memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: tmpdir(),
          filename: function (
            req: Request,
            file: Express.Multer.File,
            cb: Function,
          ) {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + "-" + file.originalname);
          },
        });
  function fileFilter(req: Request, file: Express.Multer.File, cb: Function) {
    if (!fileType.includes(file.mimetype)) {
      cb(new Error("inValid Type"));
    }
    cb(null, true);
  }

  const upload = multer({ storage,fileFilter,limits: { fileSize: maxSize } });

  return upload;
};

export default multerCloud;
