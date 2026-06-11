const register = async (name, email, password, role, phone) => {
  setLoading(true);

  try {
    let preferredLanguage = localStorage.getItem('ayn-lang') || 'en';

    // Fix language values
    if (preferredLanguage === 'en-US') preferredLanguage = 'en';
    if (preferredLanguage === 'hi-IN') preferredLanguage = 'hi';
    if (preferredLanguage === 'mr-IN') preferredLanguage = 'mr';

    const res = await api.auth.register({
      name,
      email,
      password,
      role,
      phone,
      preferredLanguage
    });

    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setUser(res.user);

      if (res.user.preferredLanguage) {
        i18n.changeLanguage(res.user.preferredLanguage);
        localStorage.setItem('ayn-lang', res.user.preferredLanguage);
      }

      return { success: true, user: res.user };
    }

    return {
      success: false,
      message: res.message || 'Registration failed'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Registration failed'
    };
  } finally {
    setLoading(false);
  }
};
