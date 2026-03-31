const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        birthday: user.birthday,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (role && role !== user.role) {
      return res.status(400).json({ message: `Wrong credentials` });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        birthday: user.birthday,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, gender, birthday } = req.body;
    const userId = req.user.id;

    // Build update object - only include fields that are provided
    const updateData = { name };
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) {
      // Handle address - can be string or object with line1/line2
      if (typeof address === 'string') {
        updateData.address = address;
      } else if (address && typeof address === 'object') {
        // Combine line1 and line2 for storage
        const line1 = address.line1 || '';
        const line2 = address.line2 || '';
        updateData.address = line2 ? `${line1}, ${line2}` : line1;
      }
    }
    if (gender !== undefined) updateData.gender = gender.toLowerCase();
    if (birthday !== undefined) updateData.birthday = birthday;
    // Handle profile picture removal
    if ('profilePicture' in req.body) {
      updateData.profilePicture = req.body.profilePicture || null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        gender: updatedUser.gender,
        birthday: updatedUser.birthday,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD PROFILE PICTURE
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: req.file.path },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        gender: updatedUser.gender,
        birthday: updatedUser.birthday,
        profilePicture: updatedUser.profilePicture,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour


    await user.save();

    // Construct reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send real email with nodemailer
    const nodemailer = require('nodemailer');


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });


    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CityPortal Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `
    });

    res.status(200).json({ 
      success: true,
      message: 'Password reset link sent to your email!' 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
};

  // RESET PASSWORD VERIFY
  exports.resetPasswordVerify = async (req, res) => {
    try {
      const { token } = req.params;

      const user = await User.findOne({ 
        resetToken: token, 
        resetTokenExpiry: { $gt: Date.now() } 
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      res.status(200).json({ 
        success: true, 
        message: "Token is valid" 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // RESET PASSWORD
  exports.resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await User.findOne({ 
        resetToken: token, 
        resetTokenExpiry: { $gt: Date.now() } 
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;

      await user.save();

      res.status(200).json({ 
        success: true, 
        message: "Password reset successful" 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // GOOGLE OAUTH LOGIN
  exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user && !user.googleId) {
      return res.status(400).json({
        message: "Please login with email/password",
      });
    }

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        profilePicture: picture,
        role: "user",
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        gender: user.gender || "",
        birthday: user.birthday || "",
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      message: "Google authentication failed",
    });
  }
};



