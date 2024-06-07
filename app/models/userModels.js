const bcrypt = require("bcryptjs");
const connection = require("../../config/db");

const UserModel = {
  async createUser(firstName, lastName, email, username, password, contactNo) {
    try {
      const hashedPassword = await bcrypt.hash(password, 5);
      const insert_query =
        "INSERT INTO users (firstName, lastName, email, username, password,  contactNo) VALUES (?, ?, ?, ?, ?, ?)";
      await connection.execute(insert_query, [
        firstName,
        lastName,
        email,
        username,
        hashedPassword,
        contactNo,
      ]);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async getUserByEmail(email) {
    try {
      const search_query = "SELECT * FROM users WHERE email = ?";
      const [existingUser] = await connection.execute(search_query, [email]);
      return existingUser[0];
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      const search_query =
        "SELECT id, firstName, lastName, email, username, contactNo FROM users WHERE id = ?";
      const [result] = await connection.execute(search_query, [userId]);
      return result[0];
    } catch (error) {
      throw error;
    }
  },

  async getUserDataByEmail(email) {
    try {
      const search_query =
        "SELECT id, firstName, lastName, email, username, contactNo, role FROM users WHERE email = ?";
      const [result] = await connection.execute(search_query, [email]);
      return result[0];
    } catch (error) {
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const search_query = "SELECT * FROM users";
      const [result] = await connection.execute(search_query);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async updateUserOTP(email, otp) {
    try {
      // Set OTP expiry time (e.g., 1 hour from now)
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 2); // Add 2 minutes

      const update_query =
        "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";
      await connection.execute(update_query, [otp, otpExpiry, email]);
    } catch (error) {
      throw error;
    }
  },

  async verifyOTP(email, otp) {
    try {
      const [result] = await connection.execute(
        "SELECT * FROM users WHERE email = ? AND otp = ?",
        [email, otp]
      );

      return result.length > 0;
    } catch (error) {
      throw error;
    }
  },


  async updateUserPassword(email, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 5);
      const update_query = "UPDATE users SET password = ? WHERE email = ?";
      await connection.execute(update_query, [hashedPassword, email]);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async updateUserData(userId, newData) {
    try {
      const { firstName, lastName, email, username, contactNo } = newData;

      // Update user data
      const update_query = `UPDATE users SET firstName = ?, lastName = ?, email = ?, username = ?, contactNo = ?, updated_at = NOW() WHERE id = ?`;
      await connection.execute(update_query, [
        firstName,
        lastName,
        email,
        username,
        contactNo,
        userId,
      ]);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async deleteUserData(userId) {
    try {
      // Check if the user exists
      const id_query = "SELECT id FROM users WHERE id = ? and status = 1";
      await connection.execute(id_query, [userId]);

      // Soft delete the user
      const updateQuery = "UPDATE users SET status = '0' WHERE id = ?";
      const [result] = await connection.execute(updateQuery, [userId]);
      return result;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = UserModel;
