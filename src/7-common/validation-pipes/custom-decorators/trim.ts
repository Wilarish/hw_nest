import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () => {
  return Transform(({ value }: TransformFnParams) => {
    try {
      if (typeof value === 'string') {
        return value.trim();
      } else {
        return value;
      }
    } catch (error) {
      console.error('Trim Error', error);
      return value;
    }
  });
};
