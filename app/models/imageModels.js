const connection = require("../../config/db");

const ImageModel = {
  async addPropertyImage(image_name, property_id) {
    try {
      const query =
        "INSERT INTO property_images (image_name, property_id) VALUES (?, ?)";
      const result = await connection.execute(query, [image_name, property_id]);
      return result;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = {
  ImageModel,
};
