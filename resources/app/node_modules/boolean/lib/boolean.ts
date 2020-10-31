const boolean = function (value: any): boolean {
  if (typeof value === 'string') {
    return [ 'true', 't', 'yes', 'y', 'on', '1' ].includes(value.trim().toLowerCase());
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return false;
};

export { boolean };
