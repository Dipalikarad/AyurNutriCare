const register = async (name, email, password, role, phone) => {
  setLoading(true);

  try {
    // ✅ Safe browser check
    let preferredLanguage = "en";

    if (typeof window !== "undefined") {
      preferredLanguage = localStorage.getItem("ayn-lang") || "en";
    }

    // Fix language values
    if (preferredLanguage === "en-US") preferredLanguage = "en";
    if (preferredLanguage === "hi-IN") preferredLanguage = "hi";
    if (preferredLanguage === "mr-IN") preferredLanguage = "mr";

    // ❗ Make sure api is imported correctly in your file
    const res = await api.auth.register({
      name,
      email,
      password,
      role,
      phone,
      preferredLanguage,
    });

    if (res?.success && res?.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
      }

      setUser(res.user);

      // ❗ Make sure i18n is imported correctly
      if (res.user?.preferredLanguage) {
        i18n.changeLanguage(res.user.preferredLanguage);

        if (typeof window !== "undefined") {
          localStorage.setItem("ayn-lang", res.user.preferredLanguage);
        }
      }

      return { success: true, user: res.user };
    }

    return {
      success: false,
      message: res?.message || "Registration failed",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Registration failed",
    };
  } finally {
    setLoading(false);
  }
};

export default register;
