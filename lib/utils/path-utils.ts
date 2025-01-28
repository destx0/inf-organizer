export const setIntendedPath = (path: string) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('intendedPath', path);
  }
};

export const getIntendedPath = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('intendedPath') || '/uploader';
  }
  return '/uploader';
};

export const clearIntendedPath = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('intendedPath');
  }
}; 