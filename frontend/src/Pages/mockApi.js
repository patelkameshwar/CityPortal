// mockApi.js

export const mockSignup = async (name, email, password) => {
  // Simulate backend delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  if (email === "test@test.com") {
    throw new Error("Email already exists");
  }

  return {
    data: {
      message: "Signup successful",
      user: { name, email },
      token: "fake-jwt-token",
    },
  };
};

export const mockLogin = async (email, password) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (email === "test@test.com" && password === "123456") {
    return {
      data: {
        message: "Login successful",
        user: { name: "Test User", email },
        token: "fake-jwt-token",
      },
    };
  } else {
    throw new Error("Invalid email or password");
  }
};
