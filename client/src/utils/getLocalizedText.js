export const getLocalizedField = (obj, field, lang) => {
  return (
    obj?.[`${field}_${lang}`] ||
    obj?.[`${field}_en`] ||
    ''
  );
};
