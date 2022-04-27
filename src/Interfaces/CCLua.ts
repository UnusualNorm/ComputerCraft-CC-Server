export type JsonTypes = string | number | object | JsonTypes[] | boolean | null;
export type Side = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';

export const paramify = (param: JsonTypes) => {
  if (typeof param == 'string') param = JSON.stringify(param);
  return param;
};

export const toParams = (...data: JsonTypes[]) => {
  let params = '';
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    const param = paramify(element);
    // If we're at the last parameter, don't add a comma
    params += `${param}${i != data.length - 1 ? ', ' : ''}`;
  }

  return params;
};
