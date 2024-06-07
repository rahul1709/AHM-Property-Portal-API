const connection = require("../../config/db");

const LocationModel = {
  async addPropertyLocation (address, pincode, property_id) {
    try {
      const query = 'INSERT INTO property_locations (address,  pincode, property_id) VALUES (?, ?, ?)';
      const result = await connection.execute(query, [address, pincode, property_id]);

      return result;
    } catch (error) {
      throw error;
    }
  },

  async deletePropertyLocation(property_id) {
    try {
      const query = "DELETE FROM property_locations WHERE property_id = ?";
      await connection.execute(query, [property_id]);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  LocationModel
};
