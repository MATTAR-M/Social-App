import { hashSync, compareSync } from "bcrypt";
import { SALT_ROUNDS } from "../../../config/config.service";

export const Hash = ({
  plainText,
  salt_rounds : SALT_ROUNDS,
}: {
  plainText: string,
  salt_rounds?: number
}): string =>{
  return hashSync(plainText.toString(), Number(SALT_ROUNDS));
}

export const Compare = ({
  plainText,
  cipherText,
}: {
  plainText: string;
  cipherText: string;
}): boolean => {
  return compareSync(plainText, cipherText);
};
