const connection = require("../../config/db");

const CategoryModel = {
  async addCategory(title) {
    try {
      const query = "INSERT INTO property_categories (title) VALUES (?)";
      const result = await connection.execute(query, [title]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getAllCategory() {
    try {
      const query = "SELECT * FROM property_categories";
      const [result] = await connection.execute(query);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getCategoryById(categoryId) {
    try {
      const query = "SELECT * FROM property_categories WHERE id = ?";
      const [result] = await connection.execute(query, [categoryId]);
      return result[0];
    } catch (error) {
      throw error;
    }
  },

  async editCategory(categoryId, newData) {
    try {
      const {title} = newData;

      const query =
        "UPDATE property_categories SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      const result = await connection.execute(query, [title, categoryId]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async deleteCategory(categoryId) {
    try {
      const query =
        "SELECT id FROM property_categories WHERE id = ? AND status = '1' ";
      await connection.execute(query, [categoryId]);

      const deleteQuery =
        "UPDATE property_categories SET status = '0', updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      const [result] = await connection
        .execute(deleteQuery, [categoryId]);

      return result;
    } catch (error) {
      throw error;
    }
  },
};
module.exports = CategoryModel;
